import { createContext } from "react";
import type { ChatMessage } from "../entities/socket";

export interface ChatContextValue {
  messages: ChatMessage[];
  sendMessage: (roomCode: string, message: string) => void;
  enterRoom: (roomCode: string) => void;
}

export const ChatContext = createContext<ChatContextValue | undefined>(
  undefined,
);
