import type { Server, Socket } from "socket.io";
import {
  hostGameSchema,
  joinRoomSchema,
  startGameSchema,
  submitAnswerSchema,
} from "shared";
import { roomsService } from "../services/rooms.service.js";
import { gameService, toPublicQuestion } from "../services/game.service.js";
import type { RoomRecord } from "../repositories/rooms.repository.js";

function broadcastLobbyPlayers(io: Server, room: RoomRecord) {
  io.to(room.code).emit("lobby_players", {
    players: room.players.map(({ socketId, name, color }) => ({
      id: socketId,
      name,
      color,
    })),
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

    const room = roomsService.joinRoom({
      socketId: socket.id,
      roomCode: parsed.data.roomCode,
      name: parsed.data.name,
      color: parsed.data.color,
    });

    if (!room) {
      return;
    }

    socket.join(room.code);
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
      question: toPublicQuestion(started.question),
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

  socket.on("next_question", (payload) => {
    const parsed = startGameSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid next_question payload", parsed.error.flatten());
      return;
    }

    const next = gameService.nextQuestion({
      socketId: socket.id,
      roomCode: parsed.data.roomCode,
    });
    if (!next) {
      return;
    }

    if (next.ended) {
      io.to(parsed.data.roomCode).emit("game_over", {
        leaderboard: next.leaderboard,
      });
      return;
    }

    io.to(parsed.data.roomCode).emit("question_started", {
      questionIndex: next.questionIndex,
      totalQuestions: next.totalQuestions,
      question: toPublicQuestion(next.question),
      startedAt: next.startedAt,
    });

    scheduleReveal(io, parsed.data.roomCode, next.question.timeLimitSeconds);
  });

  socket.on("disconnect", () => {
    const room = roomsService.leaveRoom(socket.id);
    if (room) {
      broadcastLobbyPlayers(io, room);
    }
  });
}
