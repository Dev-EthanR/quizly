import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import { ROOM_CODE_REGEX } from "shared";
import RoomNotFound from "../components/lobby/RoomNotFound";
import HostDisconnected from "../components/lobby/HostDisconnected";
import ReconnectingOverlay from "../components/lobby/ReconnectingOverlay";
import HostLobbyPanel from "../components/lobby/HostLobbyPanel";
import ParticipantLobbyPanel from "../components/lobby/ParticipantLobbyPanel";
import LobbyChat from "../components/lobby/LobbyChat";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/useSocket";
import { clearSession, loadSession, saveSession, type RoomSession } from "../lib/session";
import type {
  GameStartedPayload,
  JoinRejectedPayload,
  LobbyPlayer,
  LobbyPlayersPayload,
  RoomSettingsPayload,
  RoomStatePayload,
} from "../context/socket-context";

interface LobbyLocation {
  state?: {
    name?: string;
    color?: string;
    token?: string;
    isHost?: boolean;
  };
}

function Lobby() {
  const { roomCode } = useParams();
  const { state } = useLocation() as LobbyLocation;
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
  const [hostDisconnected, setHostDisconnected] = useState(false);
  const [hostReconnecting, setHostReconnecting] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);
  const attemptRef = useRef<"rejoin" | "join" | null>(null);

  const isValidRoomCode =
    !!roomCode && ROOM_CODE_REGEX.test(roomCode.toUpperCase());
  const isOnline = useOnlineStatus();

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

    function handleHostReconnecting() {
      setHostReconnecting(true);
    }

    function handleHostReconnected() {
      setHostReconnecting(false);
    }

    function handleHostDisconnected() {
      if (!state?.isHost) {
        setHostDisconnected(true);
      }
    }

    function handlePlayerKicked() {
      if (roomCode) {
        clearSession(roomCode);
      }
      navigate("/removed", { replace: true });
    }

    function handleJoinRejected(payload: JoinRejectedPayload) {
      if (payload.roomCode === roomCode) {
        setJoinRejection(payload.reason);
      }
    }

    function handleRoomSettings(payload: RoomSettingsPayload) {
      setChatDisabled(payload.disableChat);
    }

    socket.on("lobby_players", handleLobbyPlayers);
    socket.on("room_not_found", handleRoomNotFound);
    socket.on("join_rejected", handleJoinRejected);
    socket.on("room_settings", handleRoomSettings);
    socket.on("room_state", handleRoomState);
    socket.on("host_reconnecting", handleHostReconnecting);
    socket.on("host_reconnected", handleHostReconnected);
    socket.on("host_disconnected", handleHostDisconnected);
    socket.on("player_kicked", handlePlayerKicked);
    return () => {
      socket.off("lobby_players", handleLobbyPlayers);
      socket.off("room_not_found", handleRoomNotFound);
      socket.off("join_rejected", handleJoinRejected);
      socket.off("room_settings", handleRoomSettings);
      socket.off("room_state", handleRoomState);
      socket.off("host_reconnecting", handleHostReconnecting);
      socket.off("host_reconnected", handleHostReconnected);
      socket.off("host_disconnected", handleHostDisconnected);
      socket.off("player_kicked", handlePlayerKicked);
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

  const handleStartGame = () => {
    if (!roomCode) {
      return;
    }
    socket.emit("start_game", { roomCode });
  };

  const handleKickPlayer = (playerId: string) => {
    if (!roomCode) {
      return;
    }
    socket.emit("kick_player", { roomCode, token: playerId });
  };

  const handleSetMuted = (playerId: string, muted: boolean) => {
    if (!roomCode) {
      return;
    }
    socket.emit("set_player_muted", { roomCode, token: playerId, muted });
  };

  if (!isValidRoomCode || roomNotFound || !session) {
    return <RoomNotFound roomCode={roomCode} />;
  }

  if (joinRejection === "room_full") {
    return (
      <RoomNotFound
        roomCode={roomCode}
        title="Room is full"
        message="This room has reached its player limit."
      />
    );
  }

  if (joinRejection === "late_join_disabled") {
    return (
      <RoomNotFound
        roomCode={roomCode}
        title="Game already in progress"
        message="This game has already started and isn't accepting new players."
      />
    );
  }

  if (hostDisconnected) {
    return <HostDisconnected />;
  }

  const isHost = state?.isHost ?? session?.isHost ?? false;
  const displayName = state?.name ?? session?.name ?? "Guest";
  const displayColor = state?.color ?? session?.color;
  const isMuted = players.find((p) => p.id === session?.token)?.muted ?? false;

  return (
    <div className="min-h-screen px-4 py-10">
      {!isOnline && <ReconnectingOverlay />}

      <h1 className="mb-8 text-center text-2xl font-bold text-foreground">
        Quiz<span className="text-primary">zly</span>
      </h1>

      {hostReconnecting && !isHost && (
        <p className="mx-auto mb-6 w-fit rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm font-medium text-warning">
          Host disconnected — waiting for them to reconnect...
        </p>
      )}

      <div
        className={clsx(
          "mx-auto grid w-full max-w-5xl gap-6",
          !chatDisabled && "lg:grid-cols-[1fr_320px]",
        )}
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface/40 px-6 py-10">
          {isHost ? (
            <HostLobbyPanel
              roomCode={roomCode}
              players={players}
              onStartGame={handleStartGame}
              onKick={handleKickPlayer}
              onSetMuted={handleSetMuted}
            />
          ) : (
            <ParticipantLobbyPanel
              roomCode={roomCode}
              name={displayName}
              color={displayColor}
              players={players}
              currentPlayerId={session?.token}
            />
          )}
        </div>

        {!chatDisabled && (
          <div className="h-[520px] lg:sticky lg:top-10">
            <LobbyChat
              roomCode={roomCode}
              disabled={isMuted}
              disabledReason={isMuted ? "You have been muted by the host." : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;
