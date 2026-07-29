import { useContext } from "react";
import { ChatContext, type ChatContextValue } from "./chat-context";

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
