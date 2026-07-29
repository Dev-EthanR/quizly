import { randomUUID } from "node:crypto";
import type { Server, Socket } from "socket.io";
import { sendChatMessageSchema } from "shared";
import { roomsService } from "../services/rooms.service.js";

export function registerChatHandlers(io: Server, socket: Socket) {
  socket.on("send_message", (payload) => {
    const parsed = sendChatMessageSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Invalid send_message payload", parsed.error.flatten());
      return;
    }

    const participant = roomsService.findParticipant(socket.id);
    if (!participant || participant.roomCode !== parsed.data.roomCode) {
      return;
    }

    io.to(participant.roomCode).emit("receive_message", {
      id: randomUUID(),
      senderId: participant.token,
      senderName: participant.name,
      senderColor: participant.color,
      isHost: participant.isHost,
      message: parsed.data.message,
      sentAt: Date.now(),
    });
  });
}
