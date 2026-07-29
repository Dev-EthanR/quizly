import {
  roomsRepository,
  type RoomParticipant,
  type RoomRecord,
} from "../repositories/rooms.repository.js";

const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface HostGameParams {
  hostSocketId: string;
  quizId: string;
}

interface JoinRoomParams {
  socketId: string;
  roomCode: string;
  name: string;
  color?: string | undefined;
}

function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

function generateUniqueRoomCode(): string {
  let code = generateRoomCode();
  while (roomsRepository.has(code)) {
    code = generateRoomCode();
  }
  return code;
}

export const roomsService = {
  hostGame({ hostSocketId, quizId }: HostGameParams): RoomRecord {
    const room: RoomRecord = {
      code: generateUniqueRoomCode(),
      hostSocketId,
      quizId,
      createdAt: Date.now(),
      players: [],
    };
    roomsRepository.save(room);
    return room;
  },

  joinRoom({
    socketId,
    roomCode,
    name,
    color,
  }: JoinRoomParams): RoomRecord | undefined {
    return roomsRepository.addPlayer(roomCode, { socketId, name, color });
  },

  leaveRoom(socketId: string): RoomRecord | undefined {
    return roomsRepository.removePlayerBySocketId(socketId);
  },

  findParticipant(socketId: string): RoomParticipant | undefined {
    return roomsRepository.findParticipantBySocketId(socketId);
  },
};
