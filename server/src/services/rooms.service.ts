import {
  roomsRepository,
  DEFAULT_ROOM_SETTINGS,
  type RoomParticipant,
  type RoomRecord,
} from "../repositories/rooms.repository.js";

const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const RECONNECT_GRACE_MS = 30_000;

interface HostGameSettingsInput {
  randomizeQuestionOrder?: boolean | undefined;
  allowLateJoins?: boolean | undefined;
  showCorrectAnswers?: boolean | undefined;
  disableChat?: boolean | undefined;
  maxPlayers?: number | null | undefined;
}

interface HostGameParams {
  hostSocketId: string;
  quizId: string;
  token: string;
  userId?: string | undefined;
  settings?: HostGameSettingsInput | undefined;
}

interface JoinRoomParams {
  socketId: string;
  roomCode: string;
  name: string;
  color?: string | undefined;
  token: string;
  userId?: string | undefined;
}

export type JoinRoomResult =
  | { ok: true; room: RoomRecord }
  | { ok: false; reason: "not_found" | "late_join_disabled" | "room_full" };

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
  hostGame({
    hostSocketId,
    quizId,
    token,
    userId,
    settings,
  }: HostGameParams): RoomRecord {
    const room: RoomRecord = {
      code: generateUniqueRoomCode(),
      hostToken: token,
      hostSocketId,
      hostConnected: true,
      hostUserId: userId,
      quizId,
      createdAt: Date.now(),
      players: [],
      settings: {
        randomizeQuestionOrder:
          settings?.randomizeQuestionOrder ??
          DEFAULT_ROOM_SETTINGS.randomizeQuestionOrder,
        allowLateJoins:
          settings?.allowLateJoins ?? DEFAULT_ROOM_SETTINGS.allowLateJoins,
        showCorrectAnswers:
          settings?.showCorrectAnswers ??
          DEFAULT_ROOM_SETTINGS.showCorrectAnswers,
        disableChat: settings?.disableChat ?? DEFAULT_ROOM_SETTINGS.disableChat,
        maxPlayers: settings?.maxPlayers ?? DEFAULT_ROOM_SETTINGS.maxPlayers,
      },
    };
    roomsRepository.save(room);
    return room;
  },

  findRoom(roomCode: string): RoomRecord | undefined {
    return roomsRepository.findByCode(roomCode);
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
    userId,
  }: JoinRoomParams): JoinRoomResult {
    const room = roomsRepository.findByCode(roomCode);
    if (!room) {
      return { ok: false, reason: "not_found" };
    }

    const isExistingPlayer = room.players.some((p) => p.token === token);

    if (room.game && !room.settings.allowLateJoins && !isExistingPlayer) {
      return { ok: false, reason: "late_join_disabled" };
    }

    if (
      room.settings.maxPlayers != null &&
      !isExistingPlayer &&
      room.players.length >= room.settings.maxPlayers
    ) {
      return { ok: false, reason: "room_full" };
    }

    const updatedRoom = roomsRepository.addPlayer(roomCode, {
      token,
      socketId,
      connected: true,
      name,
      color,
      userId,
      muted: false,
    });
    if (!updatedRoom) {
      return { ok: false, reason: "not_found" };
    }

    return { ok: true, room: updatedRoom };
  },

  setPlayerMuted(
    roomCode: string,
    token: string,
    muted: boolean,
  ): RoomRecord | undefined {
    return roomsRepository.setPlayerMuted(roomCode, token, muted);
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

  kickPlayer(
    roomCode: string,
    token: string,
  ): { room: RoomRecord; socketId: string | null } | undefined {
    const player = roomsRepository.findPlayerByToken(roomCode, token);
    if (!player) {
      return undefined;
    }
    const room = roomsRepository.removePlayerByToken(roomCode, token);
    if (!room) {
      return undefined;
    }
    return { room, socketId: player.socketId };
  },

  isHost({ socketId, roomCode }: IsHostParams): boolean {
    const room = roomsRepository.findByCode(roomCode);
    return !!room && room.hostSocketId === socketId;
  },

  findParticipant(socketId: string): RoomParticipant | undefined {
    return roomsRepository.findParticipantBySocketId(socketId);
  },
};
