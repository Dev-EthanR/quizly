import type { Server, Socket } from "socket.io";
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
import type { RoomRecord } from "../repositories/rooms.repository.js";

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

function sendRoomState(socket: Socket, roomCode: string) {
  const roomState = gameService.getRoomState(roomCode);
  if (roomState) {
    socket.emit("room_state", roomState);
  }
}

export function registerGameHandlers(io: Server, socket: Socket) {
  socket.on("host_game", (payload) => {
    const parsed = hostGameSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid host_game payload", parsed.error.flatten());
      return;
    }

    const room = roomsService.hostGame({
      hostSocketId: socket.id,
      quizId: parsed.data.quizId,
      token: parsed.data.token,
      userId: parsed.data.userId,
      settings: {
        randomizeQuestionOrder: parsed.data.randomizeQuestionOrder,
        allowLateJoins: parsed.data.allowLateJoins,
        showCorrectAnswers: parsed.data.showCorrectAnswers,
        disableChat: parsed.data.disableChat,
        maxPlayers: parsed.data.maxPlayers ?? null,
      },
    });

    socket.join(room.code);
    socket.emit("room_created", { roomCode: room.code });
  });

  socket.on("join_room", (payload) => {
    const parsed = joinRoomSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid join_room payload", parsed.error.flatten());
      return;
    }

    const result = roomsService.joinRoom({
      socketId: socket.id,
      roomCode: parsed.data.roomCode,
      name: parsed.data.name,
      color: parsed.data.color,
      token: parsed.data.token,
      userId: parsed.data.userId,
    });

    if (!result.ok) {
      if (result.reason === "not_found") {
        socket.emit("room_not_found", { roomCode: parsed.data.roomCode });
      } else {
        socket.emit("join_rejected", {
          roomCode: parsed.data.roomCode,
          reason: result.reason,
        });
      }
      return;
    }

    const { room } = result;
    socket.join(room.code);
    broadcastLobbyPlayers(io, room);
    sendRoomSettings(socket, room);
    sendRoomState(socket, room.code);
  });

  socket.on("rejoin_room", (payload) => {
    const parsed = rejoinRoomSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid rejoin_room payload", parsed.error.flatten());
      return;
    }

    const { roomCode, token } = parsed.data;

    const hostRoom = roomsService.rejoinAsHost({ socketId: socket.id, roomCode, token });
    if (hostRoom) {
      clearHostDisconnectTimer(roomCode);
      socket.join(roomCode);
      broadcastLobbyPlayers(io, hostRoom);
      io.to(roomCode).emit("host_reconnected", { roomCode });
      sendRoomSettings(socket, hostRoom);
      sendRoomState(socket, roomCode);
      return;
    }

    const playerRoom = roomsService.rejoinAsPlayer({ socketId: socket.id, roomCode, token });
    if (playerRoom) {
      clearPlayerDisconnectTimer(roomCode, token);
      socket.join(roomCode);
      broadcastLobbyPlayers(io, playerRoom);
      sendRoomSettings(socket, playerRoom);
      sendRoomState(socket, roomCode);
      return;
    }

    socket.emit("room_not_found", { roomCode });
  });

  socket.on("kick_player", (payload) => {
    const parsed = kickPlayerSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid kick_player payload", parsed.error.flatten());
      return;
    }

    const { roomCode, token } = parsed.data;

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
    const parsed = setPlayerMutedSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid set_player_muted payload", parsed.error.flatten());
      return;
    }

    const { roomCode, token, muted } = parsed.data;

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
    const parsed = startGameSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid start_game payload", parsed.error.flatten());
      return;
    }

    const started = await gameService.startGame({
      socketId: socket.id,
      roomCode: parsed.data.roomCode,
    });
    if (!started) {
      return;
    }

    io.to(parsed.data.roomCode).emit("game_started", {
      roomCode: parsed.data.roomCode,
      questionIndex: started.questionIndex,
      totalQuestions: started.totalQuestions,
      question: toPublicQuestion(started.question, started.category),
      startedAt: started.startedAt,
    });

    scheduleReveal(io, parsed.data.roomCode, started.question.timeLimitSeconds);
  });

  socket.on("submit_answer", (payload) => {
    const parsed = submitAnswerSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid submit_answer payload", parsed.error.flatten());
      return;
    }

    const result = gameService.submitAnswer({
      socketId: socket.id,
      roomCode: parsed.data.roomCode,
      questionIndex: parsed.data.questionIndex,
      answerId: parsed.data.answerId,
    });
    if (!result) {
      return;
    }

    io.to(parsed.data.roomCode).emit("answer_progress", {
      answered: result.answeredCount,
      total: result.totalPlayers,
    });

    if (result.allAnswered) {
      broadcastReveal(io, parsed.data.roomCode);
    }
  });

  socket.on("show_leaderboard", (payload) => {
    const parsed = startGameSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid show_leaderboard payload", parsed.error.flatten());
      return;
    }

    const shown = gameService.markLeaderboardShown({
      socketId: socket.id,
      roomCode: parsed.data.roomCode,
    });
    if (!shown) {
      return;
    }

    io.to(parsed.data.roomCode).emit("leaderboard_shown");
  });

  socket.on("next_question", async (payload) => {
    const parsed = startGameSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid next_question payload", parsed.error.flatten());
      return;
    }

    const next = await gameService.nextQuestion({
      socketId: socket.id,
      roomCode: parsed.data.roomCode,
    });
    if (!next) {
      return;
    }

    if (next.ended) {
      io.to(parsed.data.roomCode).emit("game_over", {
        leaderboard: next.leaderboard,
        totalQuestions: next.totalQuestions,
      });
      return;
    }

    io.to(parsed.data.roomCode).emit("question_started", {
      questionIndex: next.questionIndex,
      totalQuestions: next.totalQuestions,
      question: toPublicQuestion(next.question, next.category),
      startedAt: next.startedAt,
    });

    scheduleReveal(io, parsed.data.roomCode, next.question.timeLimitSeconds);
  });

  socket.on("end_question", (payload) => {
    const parsed = startGameSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid end_question payload", parsed.error.flatten());
      return;
    }

    if (!roomsService.isHost({ socketId: socket.id, roomCode: parsed.data.roomCode })) {
      return;
    }

    // A stale scheduleReveal timeout may still fire after this — revealQuestion's
    // phase guard makes that a harmless no-op, so no timer cancellation is needed.
    broadcastReveal(io, parsed.data.roomCode);
  });

  socket.on("end_game", async (payload) => {
    const parsed = startGameSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid end_game payload", parsed.error.flatten());
      return;
    }

    const ended = await gameService.endGame({
      socketId: socket.id,
      roomCode: parsed.data.roomCode,
    });
    if (!ended) {
      return;
    }

    io.to(parsed.data.roomCode).emit("game_over", {
      leaderboard: ended.leaderboard,
      totalQuestions: ended.totalQuestions,
    });
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
