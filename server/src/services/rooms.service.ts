import {
  roomsRepository,
  type RoomParticipant,
  type RoomRecord,
} from "../repositories/rooms.repository.js";

const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const RECONNECT_GRACE_MS = 30_000;

interface HostGameParams {
  hostSocketId: string;
  quizId: string;
  token: string;
}

interface JoinRoomParams {
  socketId: string;
  roomCode: string;
  name: string;
  color?: string | undefined;
  token: string;
}

interface RejoinParams {
  socketId: string;
  roomCode: string;
  token: string;
}

interface IsHostParams {
  socketId: string;
  roomCode: string;
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
  hostGame({ hostSocketId, quizId, token }: HostGameParams): RoomRecord {
    const room: RoomRecord = {
      code: generateUniqueRoomCode(),
      hostToken: token,
      hostSocketId,
      hostConnected: true,
      quizId,
      createdAt: Date.now(),
      players: [],
    };
    roomsRepository.save(room);
    return room;
  },

  rejoinAsHost({ socketId, roomCode, token }: RejoinParams): RoomRecord | undefined {
    const room = roomsRepository.findByCode(roomCode);
    if (!room || room.hostToken !== token) {
      return undefined;
    }
    return roomsRepository.markHostConnected(roomCode, socketId);
  },

  joinRoom({
    socketId,
    roomCode,
    name,
    color,
    token,
  }: JoinRoomParams): RoomRecord | undefined {
    return roomsRepository.addPlayer(roomCode, {
      token,
      socketId,
      connected: true,
      name,
      color,
    });
  },

  rejoinAsPlayer({ socketId, roomCode, token }: RejoinParams): RoomRecord | undefined {
    const player = roomsRepository.findPlayerByToken(roomCode, token);
    if (!player) {
      return undefined;
    }
    return roomsRepository.markPlayerConnected(roomCode, token, socketId);
  },

  markHostDisconnected(socketId: string): RoomRecord | undefined {
    return roomsRepository.markHostDisconnectedBySocketId(socketId);
  },

  isHostStillDisconnected(roomCode: string): boolean {
    const room = roomsRepository.findByCode(roomCode);
    return !!room && !room.hostConnected;
  },

  deleteRoom(roomCode: string): RoomRecord | undefined {
    return roomsRepository.deleteByCode(roomCode);
  },

  markPlayerDisconnected(
    socketId: string,
  ): { room: RoomRecord; token: string } | undefined {
    return roomsRepository.markPlayerDisconnectedBySocketId(socketId);
  },

  isPlayerStillDisconnected(roomCode: string, token: string): boolean {
    const player = roomsRepository.findPlayerByToken(roomCode, token);
    return !!player && !player.connected;
  },

  removePlayer(roomCode: string, token: string): RoomRecord | undefined {
    return roomsRepository.removePlayerByToken(roomCode, token);
  },

  isHost({ socketId, roomCode }: IsHostParams): boolean {
    const room = roomsRepository.findByCode(roomCode);
    return !!room && room.hostSocketId === socketId;
  },

  findParticipant(socketId: string): RoomParticipant | undefined {
    return roomsRepository.findParticipantBySocketId(socketId);
  },
};
