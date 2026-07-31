import { ROOM_CODE_REGEX } from "shared";

export function isValidRoomCode(roomCode: string | undefined): boolean {
  return !!roomCode && ROOM_CODE_REGEX.test(roomCode.toUpperCase());
}
