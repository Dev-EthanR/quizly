import { useRequiredContext } from "./createContextHook";
import { ChatContext, type ChatContextValue } from "./chat-context";

export function useChat(): ChatContextValue {
  return useRequiredContext(ChatContext, "ChatProvider");
}
