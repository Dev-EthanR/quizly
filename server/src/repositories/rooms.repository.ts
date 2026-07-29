export interface PlayerRecord {
  socketId: string;
  name: string;
  color?: string | undefined;
}

export interface RoomRecord {
  code: string;
  hostSocketId: string;
  quizId: string;
  createdAt: number;
  players: PlayerRecord[];
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

  addPlayer(code: string, player: PlayerRecord): RoomRecord | undefined {
    const room = rooms.get(code);
    if (!room) {
      return undefined;
    }
    room.players = [
      ...room.players.filter((p) => p.socketId !== player.socketId),
      player,
    ];
    return room;
  },

  removePlayerBySocketId(socketId: string): RoomRecord | undefined {
    for (const room of rooms.values()) {
      const index = room.players.findIndex((p) => p.socketId === socketId);
      if (index !== -1) {
        room.players.splice(index, 1);
        return room;
      }
    }
    return undefined;
  },
};
