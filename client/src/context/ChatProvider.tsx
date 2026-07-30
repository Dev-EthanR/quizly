import { useCallback, useEffect, useReducer, type ReactNode } from "react";
import { useSocket } from "./useSocket";
import { ChatContext, type ChatContextValue } from "./chat-context";
import type { ChatMessage } from "../entities/socket";

interface ChatState {
  roomCode: string | null;
  messages: ChatMessage[];
}

type ChatAction =
  | { type: "ENTER_ROOM"; roomCode: string }
  | { type: "MESSAGE_RECEIVED"; message: ChatMessage };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ENTER_ROOM":
      if (state.roomCode === action.roomCode) {
        return state;
      }
      return { roomCode: action.roomCode, messages: [] };
    case "MESSAGE_RECEIVED":
      return { ...state, messages: [...state.messages, action.message] };
    default:
      return state;
  }
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { socket, status } = useSocket();
  const [state, dispatch] = useReducer(chatReducer, {
    roomCode: null,
    messages: [],
  });

  useEffect(() => {
    function handleReceiveMessage(message: ChatMessage) {
      dispatch({ type: "MESSAGE_RECEIVED", message });
    }

    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  const enterRoom = useCallback((roomCode: string) => {
    dispatch({ type: "ENTER_ROOM", roomCode });
  }, []);

  const sendMessage = useCallback(
    (roomCode: string, message: string) => {
      if (status !== "connected") {
        return;
      }
      socket.emit("send_message", { roomCode, message });
    },
    [socket, status],
  );

  const value: ChatContextValue = {
    messages: state.messages,
    sendMessage,
    enterRoom,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
