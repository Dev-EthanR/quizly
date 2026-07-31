import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROOM_CODE_REGEX } from "shared";
import { useSocket } from "../context/useSocket";
import { clearSession } from "../lib/session";
import type { RoomSettingsPayload } from "../entities/socket";

export interface UseRoomPresenceParams {
  roomCode: string | undefined;
  isHost: boolean;
}

export interface UseRoomPresenceResult {
  hostDisconnected: boolean;
  hostReconnecting: boolean;
  chatDisabled: boolean;
}

export function useRoomPresence({
  roomCode,
  isHost,
}: UseRoomPresenceParams): UseRoomPresenceResult {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [hostDisconnected, setHostDisconnected] = useState(false);
  const [hostReconnecting, setHostReconnecting] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);

  const isValidRoomCode =
    !!roomCode && ROOM_CODE_REGEX.test(roomCode.toUpperCase());

  useEffect(() => {
    if (!isValidRoomCode) {
      return;
    }

    function handleHostReconnecting() {
      setHostReconnecting(true);
    }

    function handleHostReconnected() {
      setHostReconnecting(false);
    }

    function handleHostDisconnected() {
      if (!isHost) {
        setHostDisconnected(true);
      }
    }

    function handlePlayerKicked() {
      if (roomCode) {
        clearSession(roomCode);
      }
      navigate("/removed", { replace: true });
    }

    function handleRoomSettings(payload: RoomSettingsPayload) {
      setChatDisabled(payload.disableChat);
    }

    socket.on("host_reconnecting", handleHostReconnecting);
    socket.on("host_reconnected", handleHostReconnected);
    socket.on("host_disconnected", handleHostDisconnected);
    socket.on("player_kicked", handlePlayerKicked);
    socket.on("room_settings", handleRoomSettings);
    return () => {
      socket.off("host_reconnecting", handleHostReconnecting);
      socket.off("host_reconnected", handleHostReconnected);
      socket.off("host_disconnected", handleHostDisconnected);
      socket.off("player_kicked", handlePlayerKicked);
      socket.off("room_settings", handleRoomSettings);
    };
  }, [isValidRoomCode, socket, isHost, roomCode, navigate]);

  return { hostDisconnected, hostReconnecting, chatDisabled };
}
