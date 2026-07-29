import { createContext } from "react";
import type { Socket } from "socket.io-client";

// Filled in as the server defines real events — never emit/listen for
// something that isn't a key here (keeps client + server event names in sync).
export type ServerToClientEvents = Record<string, never>;
export type ClientToServerEvents = Record<string, never>;

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketStatus = "connecting" | "connected" | "disconnected";

export interface SocketContextValue {
  socket: AppSocket;
  status: SocketStatus;
}

export const SocketContext = createContext<SocketContextValue | undefined>(
  undefined,
);
