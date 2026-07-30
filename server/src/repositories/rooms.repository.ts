import type { QuizCategory } from "shared";

export interface PlayerRecord {
  token: string;
  socketId: string | null;
  connected: boolean;
  name: string;
  color?: string | undefined;
  userId?: string | undefined;
}

export interface GameAnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface GameQuestion {
  id: string;
  prompt: string;
  timeLimitSeconds: number;
  points: number;
  answers: GameAnswerOption[];
}

export interface QuestionAnswer {
  token: string;
  answerId: string;
  answeredAt: number;
}

export type GamePhase = "question" | "reveal" | "ended";

export interface GameState {
  questions: GameQuestion[];
  currentQuestionIndex: number;
  phase: GamePhase;
  questionStartedAt: number;
  answers: QuestionAnswer[];
  scores: Record<string, number>;
  correctCounts: Record<string, number>;
  answerTimeTotals: Record<string, number>;
  answeredCounts: Record<string, number>;
  category: QuizCategory | null;
  leaderboardShown: boolean;
}

export interface RoomRecord {
  code: string;
  hostToken: string;
  hostSocketId: string | null;
  hostConnected: boolean;
  hostUserId?: string | undefined;
  quizId: string;
  createdAt: number;
  players: PlayerRecord[];
  game?: GameState | undefined;
}

export interface RoomParticipant {
  roomCode: string;
  token: string;
  name: string;
  color?: string | undefined;
  isHost: boolean;
}

const rooms = new Map<string, RoomRecord>();

export const roomsRepository = {
  has(code: string): boolean {
    return rooms.has(code);
  },

  save(room: RoomRecord): void {
    rooms.set(room.code, room);
  },

  findByCode(code: string): RoomRecord | undefined {
    return rooms.get(code);
  },

  deleteByCode(code: string): RoomRecord | undefined {
    const room = rooms.get(code);
    if (room) {
      rooms.delete(code);
    }
    return room;
  },

  findRoomByHostToken(token: string): RoomRecord | undefined {
    for (const room of rooms.values()) {
      if (room.hostToken === token) {
        return room;
      }
    }
    return undefined;
  },

  findRoomByHostSocketId(socketId: string): RoomRecord | undefined {
    for (const room of rooms.values()) {
      if (room.hostSocketId === socketId) {
        return room;
      }
    }
    return undefined;
  },

  markHostConnected(code: string, socketId: string): RoomRecord | undefined {
    const room = rooms.get(code);
    if (!room) {
      return undefined;
    }
    room.hostSocketId = socketId;
    room.hostConnected = true;
    return room;
  },

  markHostDisconnectedBySocketId(socketId: string): RoomRecord | undefined {
    const room = roomsRepository.findRoomByHostSocketId(socketId);
    if (!room) {
      return undefined;
    }
    room.hostConnected = false;
    room.hostSocketId = null;
    return room;
  },

  findPlayerByToken(code: string, token: string): PlayerRecord | undefined {
    return rooms.get(code)?.players.find((p) => p.token === token);
  },

  addPlayer(code: string, player: PlayerRecord): RoomRecord | undefined {
    const room = rooms.get(code);
    if (!room) {
      return undefined;
    }
    room.players = [
      ...room.players.filter((p) => p.token !== player.token),
      player,
    ];
    return room;
  },

  markPlayerConnected(
    code: string,
    token: string,
    socketId: string,
  ): RoomRecord | undefined {
    const room = rooms.get(code);
    const player = room?.players.find((p) => p.token === token);
    if (!room || !player) {
      return undefined;
    }
    player.socketId = socketId;
    player.connected = true;
    return room;
  },

  markPlayerDisconnectedBySocketId(
    socketId: string,
  ): { room: RoomRecord; token: string } | undefined {
    for (const room of rooms.values()) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) {
        player.connected = false;
        player.socketId = null;
        return { room, token: player.token };
      }
    }
    return undefined;
  },

  removePlayerByToken(code: string, token: string): RoomRecord | undefined {
    const room = rooms.get(code);
    if (!room) {
      return undefined;
    }
    const index = room.players.findIndex((p) => p.token === token);
    if (index !== -1) {
      room.players.splice(index, 1);
    }
    return room;
  },

  setGame(code: string, game: GameState): void {
    const room = rooms.get(code);
    if (room) {
      room.game = game;
    }
  },

  findParticipantBySocketId(socketId: string): RoomParticipant | undefined {
    for (const room of rooms.values()) {
      if (room.hostSocketId === socketId) {
        return {
          roomCode: room.code,
          token: room.hostToken,
          name: "Host",
          isHost: true,
        };
      }
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) {
        return {
          roomCode: room.code,
          token: player.token,
          name: player.name,
          color: player.color,
          isHost: false,
        };
      }
    }
    return undefined;
  },
};
