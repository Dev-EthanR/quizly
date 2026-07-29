import { createContext } from "react";
import type { Socket } from "socket.io-client";
import type { HostGameInput } from "shared";

export interface RoomCreatedPayload {
  roomCode: string;
}

// Filled in as the server defines real events — never emit/listen for
// something that isn't a key here (keeps client + server event names in sync).
export interface ServerToClientEvents {
  room_created: (payload: RoomCreatedPayload) => void;
}

export interface ClientToServerEvents {
  host_game: (payload: HostGameInput) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketStatus = "connecting" | "connected" | "disconnected";

export interface SocketContextValue {
  socket: AppSocket;
  status: SocketStatus;
}

export const SocketContext = createContext<SocketContextValue | undefined>(
  undefined,
);
