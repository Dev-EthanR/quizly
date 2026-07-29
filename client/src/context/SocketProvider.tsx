import { useEffect, useReducer, useState, type ReactNode } from "react";
import { io } from "socket.io-client";
import {
  SocketContext,
  type AppSocket,
  type SocketContextValue,
  type SocketStatus,
} from "./socket-context";

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ??
  "";

type SocketAction = { type: "CONNECTED" } | { type: "DISCONNECTED" };

function socketStatusReducer(
  _state: SocketStatus,
  action: SocketAction,
): SocketStatus {
  switch (action.type) {
    case "CONNECTED":
      return "connected";
    case "DISCONNECTED":
      return "disconnected";
    default:
      return _state;
  }
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket] = useState<AppSocket>(() =>
    io(SOCKET_URL, { autoConnect: false })
  );
  const [status, dispatch] = useReducer(socketStatusReducer, "connecting");

  useEffect(() => {
    function handleConnect() {
      dispatch({ type: "CONNECTED" });
    }
    function handleDisconnect() {
      dispatch({ type: "DISCONNECTED" });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  const value: SocketContextValue = { socket, status };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
