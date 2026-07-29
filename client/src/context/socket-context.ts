import { createContext } from "react";
import type { Socket } from "socket.io-client";
import type {
  HostGameInput,
  JoinRoomInput,
  SendChatMessageInput,
} from "shared";

export interface RoomCreatedPayload {
  roomCode: string;
}

export interface LobbyPlayer {
  id: string;
  name: string;
  color?: string;
}

export interface LobbyPlayersPayload {
  players: LobbyPlayer[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: string;
  isHost: boolean;
  message: string;
  sentAt: number;
}

// Filled in as the server defines real events — never emit/listen for
// something that isn't a key here (keeps client + server event names in sync).
export interface ServerToClientEvents {
  room_created: (payload: RoomCreatedPayload) => void;
  lobby_players: (payload: LobbyPlayersPayload) => void;
  receive_message: (payload: ChatMessage) => void;
}

export interface ClientToServerEvents {
  host_game: (payload: HostGameInput) => void;
  join_room: (payload: JoinRoomInput) => void;
  send_message: (payload: SendChatMessageInput) => void;
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
