import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/useSocket";
import { clearSession, loadSession, saveSession } from "../lib/session";
import type { RoomSession } from "../entities/session";
import type {
  GameStartedPayload,
  JoinRejectedPayload,
  LobbyPlayer,
  LobbyPlayersPayload,
  RoomStatePayload,
} from "../entities/socket";

export interface LobbyLocationState {
  name?: string;
  color?: string;
  token?: string;
  isHost?: boolean;
}

export interface UsePlayJoinFlowParams {
  roomCode: string | undefined;
  isValidRoomCode: boolean;
  state: LobbyLocationState | undefined;
}

export interface UsePlayJoinFlowResult {
  session: RoomSession | null;
  players: LobbyPlayer[];
  roomNotFound: boolean;
  joinRejection: JoinRejectedPayload["reason"] | null;
}

export function usePlayJoinFlow({
  roomCode,
  isValidRoomCode,
  state,
}: UsePlayJoinFlowParams): UsePlayJoinFlowResult {
  const navigate = useNavigate();
  const { socket, status } = useSocket();
  const { user } = useAuth();
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const hadExistingSessionRef = useRef<boolean>(
    !!(roomCode && loadSession(roomCode)),
  );
  const [session, setSession] = useState<RoomSession | null>(() => {
    if (!roomCode) {
      return null;
    }
    const existing = loadSession(roomCode);
    if (existing) {
      return existing;
    }
    if (!state?.isHost && state?.name && state?.token) {
      const fresh: RoomSession = {
        roomCode,
        token: state.token,
        isHost: false,
        name: state.name,
        color: state.color,
      };
      saveSession(fresh);
      return fresh;
    }
    return null;
  });
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [joinRejection, setJoinRejection] = useState<
    JoinRejectedPayload["reason"] | null
  >(null);
  const attemptRef = useRef<"rejoin" | "join" | null>(null);

  useEffect(() => {
    if (!isValidRoomCode) {
      return;
    }

    function handleLobbyPlayers(payload: LobbyPlayersPayload) {
      setPlayers(payload.players);
    }

    function handleRoomNotFound() {
      const canFallbackToFreshJoin =
        attemptRef.current === "rejoin" &&
        !state?.isHost &&
        !!state?.name &&
        !!state?.token;

      if (attemptRef.current === "rejoin" && roomCode) {
        clearSession(roomCode);
      }

      if (canFallbackToFreshJoin && roomCode && state?.name && state?.token) {
        const fresh: RoomSession = {
          roomCode,
          token: state.token,
          isHost: false,
          name: state.name,
          color: state.color,
        };
        saveSession(fresh);
        hadExistingSessionRef.current = false;
        attemptRef.current = null;
        setSession(fresh);
        return;
      }

      setRoomNotFound(true);
    }

    function handleRoomState(payload: RoomStatePayload) {
      if (payload.phase !== "lobby" && roomCode) {
        navigate(`/play/${roomCode}`, { replace: true });
      }
    }

    function handleJoinRejected(payload: JoinRejectedPayload) {
      if (payload.roomCode === roomCode) {
        setJoinRejection(payload.reason);
      }
    }

    socket.on("lobby_players", handleLobbyPlayers);
    socket.on("room_not_found", handleRoomNotFound);
    socket.on("join_rejected", handleJoinRejected);
    socket.on("room_state", handleRoomState);
    return () => {
      socket.off("lobby_players", handleLobbyPlayers);
      socket.off("room_not_found", handleRoomNotFound);
      socket.off("join_rejected", handleJoinRejected);
      socket.off("room_state", handleRoomState);
    };
  }, [
    isValidRoomCode,
    socket,
    state?.isHost,
    state?.name,
    state?.token,
    state?.color,
    roomCode,
    navigate,
  ]);

  useEffect(() => {
    if (status === "disconnected") {
      attemptRef.current = null;
    }
  }, [status]);

  useEffect(() => {
    if (
      !isValidRoomCode ||
      !roomCode ||
      status !== "connected" ||
      attemptRef.current ||
      !session
    ) {
      return;
    }

    if (hadExistingSessionRef.current) {
      attemptRef.current = "rejoin";
      socket.emit("rejoin_room", { roomCode, token: session.token });
      return;
    }

    attemptRef.current = "join";
    socket.emit("join_room", {
      roomCode,
      name: session.name ?? "Guest",
      color: session.color,
      token: session.token,
      userId: user?.id,
    });
  }, [isValidRoomCode, roomCode, status, session, socket, user?.id]);

  useEffect(() => {
    if (!isValidRoomCode) {
      return;
    }

    function handleGameStarted(payload: GameStartedPayload) {
      navigate(`/play/${payload.roomCode}`, {
        replace: true,
        state: {
          ...state,
          questionIndex: payload.questionIndex,
          totalQuestions: payload.totalQuestions,
          question: payload.question,
          startedAt: payload.startedAt,
        },
      });
    }

    socket.on("game_started", handleGameStarted);
    return () => {
      socket.off("game_started", handleGameStarted);
    };
  }, [isValidRoomCode, socket, navigate, state]);

  return { session, players, roomNotFound, joinRejection };
}
