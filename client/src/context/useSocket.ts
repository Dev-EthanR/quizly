import { useRequiredContext } from "./createContextHook";
import { SocketContext, type SocketContextValue } from "./socket-context";

export function useSocket(): SocketContextValue {
  return useRequiredContext(SocketContext, "SocketProvider");
}
