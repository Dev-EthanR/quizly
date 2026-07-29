export interface RoomRecord {
  code: string;
  hostSocketId: string;
  quizId: string;
  createdAt: number;
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
};
