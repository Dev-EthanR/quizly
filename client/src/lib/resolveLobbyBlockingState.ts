import type { RoomSession } from "../entities/session";
import type { JoinRejectedPayload } from "../entities/socket";

export interface ResolveLobbyBlockingStateParams {
  isValidRoomCode: boolean;
  roomNotFound: boolean;
  session: RoomSession | null;
  joinRejection: JoinRejectedPayload["reason"] | null;
  hostDisconnected: boolean;
}

export type LobbyBlockingState =
  | { screen: "room-not-found" }
  | { screen: "room-full" }
  | { screen: "late-join-disabled" }
  | { screen: "host-disconnected" };

export function resolveLobbyBlockingState({
  isValidRoomCode,
  roomNotFound,
  session,
  joinRejection,
  hostDisconnected,
}: ResolveLobbyBlockingStateParams): LobbyBlockingState | null {
  if (!isValidRoomCode || roomNotFound || !session) {
    return { screen: "room-not-found" };
  }

  if (joinRejection === "room_full") {
    return { screen: "room-full" };
  }

  if (joinRejection === "late_join_disabled") {
    return { screen: "late-join-disabled" };
  }

  if (hostDisconnected) {
    return { screen: "host-disconnected" };
  }

  return null;
}
