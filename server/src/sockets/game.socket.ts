import type { Socket } from "socket.io";
import { hostGameSchema } from "shared";
import { roomsService } from "../services/rooms.service.js";

export function registerGameHandlers(socket: Socket) {
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
}
