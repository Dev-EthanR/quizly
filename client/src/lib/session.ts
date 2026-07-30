import type { RoomSession } from "../entities/session";

const STORAGE_KEY_PREFIX = "quizly:session:";

function storageKey(roomCode: string): string {
  return `${STORAGE_KEY_PREFIX}${roomCode.toUpperCase()}`;
}

export function createSessionToken(): string {
  return crypto.randomUUID();
}

export function saveSession(session: RoomSession): void {
  sessionStorage.setItem(storageKey(session.roomCode), JSON.stringify(session));
}

export function loadSession(roomCode: string): RoomSession | null {
  const raw = sessionStorage.getItem(storageKey(roomCode));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as RoomSession;
  } catch {
    return null;
  }
}

export function clearSession(roomCode: string): void {
  sessionStorage.removeItem(storageKey(roomCode));
}
