import type { Server, Socket } from "socket.io";
import type { ZodType } from "zod";
import {
  hostGameSchema,
  joinRoomSchema,
  kickPlayerSchema,
  rejoinRoomSchema,
  setPlayerMutedSchema,
  startGameSchema,
  submitAnswerSchema,
} from "shared";
import { roomsService, RECONNECT_GRACE_MS } from "../services/rooms.service.js";
import { gameService, toPublicQuestion } from "../services/game.service.js";
import type { RoomRecord } from "../entities/room.js";

const hostDisconnectTimers = new Map<string, NodeJS.Timeout>();
const playerDisconnectTimers = new Map<string, NodeJS.Timeout>();

function playerTimerKey(roomCode: string, token: string): string {
  return `${roomCode}:${token}`;
}

function clearHostDisconnectTimer(roomCode: string): void {
  const timer = hostDisconnectTimers.get(roomCode);
  if (timer) {
    clearTimeout(timer);
    hostDisconnectTimers.delete(roomCode);
  }
}

function clearPlayerDisconnectTimer(roomCode: string, token: string): void {
  const key = playerTimerKey(roomCode, token);
  const timer = playerDisconnectTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    playerDisconnectTimers.delete(key);
  }
}

function parseOrWarn<T>(
  schema: ZodType<T>,
  payload: unknown,
  eventName: string,
): T | undefined {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    console.warn(`Invalid ${eventName} payload`, parsed.error.flatten());
    return undefined;
  }

  return parsed.data;
}

function broadcastLobbyPlayers(io: Server, room: RoomRecord) {
  io.to(room.code).emit("lobby_players", {
    players: room.players.map(({ token, name, color, connected, muted }) => ({
      id: token,
      name,
      color,
      connected,
      muted,
    })),
  });
}

function sendRoomSettings(socket: Socket, room: RoomRecord) {
  socket.emit("room_settings", {
    disableChat: room.settings.disableChat,
    maxPlayers: room.settings.maxPlayers,
  });
}

function sendRoomState(socket: Socket, roomCode: string) {
  const roomState = gameService.getRoomState(roomCode);
  if (roomState) {
    socket.emit("room_state", roomState);
  }
}

function syncClientIntoRoom(io: Server, socket: Socket, room: RoomRecord) {
  broadcastLobbyPlayers(io, room);
  sendRoomSettings(socket, room);
  sendRoomState(socket, room.code);
}

function broadcastReveal(io: Server, roomCode: string) {
  const reveal = gameService.revealQuestion(roomCode);
  if (!reveal) {
    return;
  }

  io.to(roomCode).emit("question_reveal", reveal);
}

function scheduleReveal(io: Server, roomCode: string, timeLimitSeconds: number) {
  setTimeout(() => broadcastReveal(io, roomCode), timeLimitSeconds * 1000);
}

export function registerGameHandlers(io: Server, socket: Socket) {
  socket.on("host_game", (payload) => {
    const parsed = parseOrWarn(hostGameSchema, payload, "host_game");
    if (!parsed) {
      return;
    }

    const room = roomsService.hostGame({
      hostSocketId: socket.id,
      quizId: parsed.quizId,
      token: parsed.token,
      userId: parsed.userId,
      settings: {
        randomizeQuestionOrder: parsed.randomizeQuestionOrder,
        allowLateJoins: parsed.allowLateJoins,
        showCorrectAnswers: parsed.showCorrectAnswers,
        disableChat: parsed.disableChat,
        maxPlayers: parsed.maxPlayers ?? null,
      },
    });

    socket.join(room.code);
    socket.emit("room_created", { roomCode: room.code });
  });

  socket.on("join_room", (payload) => {
    const parsed = parseOrWarn(joinRoomSchema, payload, "join_room");
    if (!parsed) {
      return;
    }

    const result = roomsService.joinRoom({
      socketId: socket.id,
      roomCode: parsed.roomCode,
      name: parsed.name,
      color: parsed.color,
      token: parsed.token,
      userId: parsed.userId,
    });

    if (!result.ok) {
      if (result.reason === "not_found") {
        socket.emit("room_not_found", { roomCode: parsed.roomCode });
      } else {
        socket.emit("join_rejected", {
          roomCode: parsed.roomCode,
          reason: result.reason,
        });
      }
      return;
    }

    const { room } = result;
    socket.join(room.code);
    syncClientIntoRoom(io, socket, room);
  });

  socket.on("rejoin_room", (payload) => {
    const parsed = parseOrWarn(rejoinRoomSchema, payload, "rejoin_room");
    if (!parsed) {
      return;
    }

    const { roomCode, token } = parsed;

    const hostRoom = roomsService.rejoinAsHost({ socketId: socket.id, roomCode, token });
    if (hostRoom) {
      clearHostDisconnectTimer(roomCode);
      socket.join(roomCode);
      io.to(roomCode).emit("host_reconnected", { roomCode });
      syncClientIntoRoom(io, socket, hostRoom);
      return;
    }

    const playerRoom = roomsService.rejoinAsPlayer({ socketId: socket.id, roomCode, token });
    if (playerRoom) {
      clearPlayerDisconnectTimer(roomCode, token);
      socket.join(roomCode);
      syncClientIntoRoom(io, socket, playerRoom);
      return;
    }

    socket.emit("room_not_found", { roomCode });
  });

  socket.on("kick_player", (payload) => {
    const parsed = parseOrWarn(kickPlayerSchema, payload, "kick_player");
    if (!parsed) {
      return;
    }

    const { roomCode, token } = parsed;

    if (!roomsService.isHost({ socketId: socket.id, roomCode })) {
      return;
    }

    const kicked = roomsService.kickPlayer(roomCode, token);
    if (!kicked) {
      return;
    }

    clearPlayerDisconnectTimer(roomCode, token);

    const { room, socketId: kickedSocketId } = kicked;
    if (kickedSocketId) {
      const kickedSocket = io.sockets.sockets.get(kickedSocketId);
      if (kickedSocket) {
        kickedSocket.emit("player_kicked", { roomCode });
        kickedSocket.leave(roomCode);
      }
    }

    broadcastLobbyPlayers(io, room);
  });

  socket.on("set_player_muted", (payload) => {
    const parsed = parseOrWarn(setPlayerMutedSchema, payload, "set_player_muted");
    if (!parsed) {
      return;
    }

    const { roomCode, token, muted } = parsed;

    if (!roomsService.isHost({ socketId: socket.id, roomCode })) {
      return;
    }

    const room = roomsService.setPlayerMuted(roomCode, token, muted);
    if (!room) {
      return;
    }

    broadcastLobbyPlayers(io, room);
  });

  socket.on("start_game", async (payload) => {
    const parsed = parseOrWarn(startGameSchema, payload, "start_game");
    if (!parsed) {
      return;
    }

    const started = await gameService.startGame({
      socketId: socket.id,
      roomCode: parsed.roomCode,
    });
    if (!started) {
      return;
    }

    io.to(parsed.roomCode).emit("game_started", {
      roomCode: parsed.roomCode,
      questionIndex: started.questionIndex,
      totalQuestions: started.totalQuestions,
      question: toPublicQuestion(started.question, started.category),
      startedAt: started.startedAt,
    });

    scheduleReveal(io, parsed.roomCode, started.question.timeLimitSeconds);
  });

  socket.on("submit_answer", (payload) => {
    const parsed = parseOrWarn(submitAnswerSchema, payload, "submit_answer");
    if (!parsed) {
      return;
    }

    const result = gameService.submitAnswer({
      socketId: socket.id,
      roomCode: parsed.roomCode,
      questionIndex: parsed.questionIndex,
      answerId: parsed.answerId,
    });
    if (!result) {
      return;
    }

    io.to(parsed.roomCode).emit("answer_progress", {
      answered: result.answeredCount,
      total: result.totalPlayers,
    });

    if (result.allAnswered) {
      broadcastReveal(io, parsed.roomCode);
    }
  });

  socket.on("show_leaderboard", (payload) => {
    const parsed = parseOrWarn(startGameSchema, payload, "show_leaderboard");
    if (!parsed) {
      return;
    }

    const shown = gameService.markLeaderboardShown({
      socketId: socket.id,
      roomCode: parsed.roomCode,
    });
    if (!shown) {
      return;
    }

    io.to(parsed.roomCode).emit("leaderboard_shown");
  });

  socket.on("next_question", async (payload) => {
    const parsed = parseOrWarn(startGameSchema, payload, "next_question");
    if (!parsed) {
      return;
    }

    const next = await gameService.nextQuestion({
      socketId: socket.id,
      roomCode: parsed.roomCode,
    });
    if (!next) {
      return;
    }

    if (next.ended) {
      io.to(parsed.roomCode).emit("game_over", next.summary);
      return;
    }

    io.to(parsed.roomCode).emit("question_started", {
      questionIndex: next.questionIndex,
      totalQuestions: next.totalQuestions,
      question: toPublicQuestion(next.question, next.category),
      startedAt: next.startedAt,
    });

    scheduleReveal(io, parsed.roomCode, next.question.timeLimitSeconds);
  });

  socket.on("end_question", (payload) => {
    const parsed = parseOrWarn(startGameSchema, payload, "end_question");
    if (!parsed) {
      return;
    }

    if (!roomsService.isHost({ socketId: socket.id, roomCode: parsed.roomCode })) {
      return;
    }

    // A stale scheduleReveal timeout may still fire after this — revealQuestion's
    // phase guard makes that a harmless no-op, so no timer cancellation is needed.
    broadcastReveal(io, parsed.roomCode);
  });

  socket.on("end_game", async (payload) => {
    const parsed = parseOrWarn(startGameSchema, payload, "end_game");
    if (!parsed) {
      return;
    }

    const ended = await gameService.endGame({
      socketId: socket.id,
      roomCode: parsed.roomCode,
    });
    if (!ended) {
      return;
    }

    io.to(parsed.roomCode).emit("game_over", ended);
  });

  socket.on("disconnect", () => {
    const hostRoom = roomsService.markHostDisconnected(socket.id);
    if (hostRoom) {
      io.to(hostRoom.code).emit("host_reconnecting", { roomCode: hostRoom.code });

      const timer = setTimeout(() => {
        hostDisconnectTimers.delete(hostRoom.code);
        if (!roomsService.isHostStillDisconnected(hostRoom.code)) {
          return;
        }
        const deletedRoom = roomsService.deleteRoom(hostRoom.code);
        if (deletedRoom) {
          io.to(hostRoom.code).emit("host_disconnected", { roomCode: hostRoom.code });
        }
      }, RECONNECT_GRACE_MS);

      hostDisconnectTimers.set(hostRoom.code, timer);
      return;
    }

    const disconnectedPlayer = roomsService.markPlayerDisconnected(socket.id);
    if (disconnectedPlayer) {
      const { room, token } = disconnectedPlayer;
      broadcastLobbyPlayers(io, room);

      const timer = setTimeout(() => {
        playerDisconnectTimers.delete(playerTimerKey(room.code, token));
        if (!roomsService.isPlayerStillDisconnected(room.code, token)) {
          return;
        }
        const updatedRoom = roomsService.removePlayer(room.code, token);
        if (updatedRoom) {
          broadcastLobbyPlayers(io, updatedRoom);
        }
      }, RECONNECT_GRACE_MS);

      playerDisconnectTimers.set(playerTimerKey(room.code, token), timer);
    }
  });
}
