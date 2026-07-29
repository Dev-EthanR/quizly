import type { Server, Socket } from "socket.io";
import { hostGameSchema, joinRoomSchema, startGameSchema } from "shared";
import { roomsService } from "../services/rooms.service.js";
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

  socket.on("start_game", (payload) => {
    const parsed = startGameSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid start_game payload", parsed.error.flatten());
      return;
    }

    const participant = roomsService.findParticipant(socket.id);
    if (
      !participant ||
      !participant.isHost ||
      participant.roomCode !== parsed.data.roomCode
    ) {
      return;
    }

    io.to(parsed.data.roomCode).emit("game_started", {
      roomCode: parsed.data.roomCode,
    });
  });

  socket.on("disconnect", () => {
    const room = roomsService.leaveRoom(socket.id);
    if (room) {
      broadcastLobbyPlayers(io, room);
    }
  });
}
