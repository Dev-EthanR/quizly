import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ROOM_CODE_REGEX } from "shared";
import RoomNotFound from "../components/lobby/RoomNotFound";
import ReconnectingOverlay from "../components/lobby/ReconnectingOverlay";
import HostLobbyPanel from "../components/lobby/HostLobbyPanel";
import ParticipantLobbyPanel from "../components/lobby/ParticipantLobbyPanel";
import LobbyChat from "../components/lobby/LobbyChat";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useSocket } from "../context/useSocket";
import type {
  GameStartedPayload,
  LobbyPlayer,
  LobbyPlayersPayload,
} from "../context/socket-context";

interface LobbyLocation {
  state?: {
    name?: string;
    color?: string;
    isHost?: boolean;
  };
}

function Lobby() {
  const { roomCode } = useParams();
  const { state } = useLocation() as LobbyLocation;
  const navigate = useNavigate();
  const { socket, status } = useSocket();
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const hasJoinedRef = useRef(false);

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

    socket.on("lobby_players", handleLobbyPlayers);
    return () => {
      socket.off("lobby_players", handleLobbyPlayers);
    };
  }, [isValidRoomCode, socket]);

  useEffect(() => {
    if (state?.isHost || !isValidRoomCode || !roomCode || !state?.name) {
      return;
    }

    if (status === "connected" && !hasJoinedRef.current) {
      socket.emit("join_room", {
        roomCode,
        name: state.name,
        color: state.color,
      });
      hasJoinedRef.current = true;
    }
  }, [
    state?.isHost,
    state?.name,
    state?.color,
    isValidRoomCode,
    roomCode,
    status,
    socket,
  ]);

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

  if (!isValidRoomCode) {
    return <RoomNotFound roomCode={roomCode} />;
  }

  return (
    <div className="min-h-screen px-4 py-10">
      {!isOnline && <ReconnectingOverlay />}

      <h1 className="mb-8 text-center text-2xl font-bold text-foreground">
        Quiz<span className="text-primary">zly</span>
      </h1>

      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface/40 px-6 py-10">
          {state?.isHost ? (
            <HostLobbyPanel
              roomCode={roomCode}
              players={players}
              onStartGame={handleStartGame}
            />
          ) : (
            <ParticipantLobbyPanel
              roomCode={roomCode}
              name={state?.name ?? "Guest"}
              color={state?.color}
              players={players}
              currentPlayerId={socket.id}
            />
          )}
        </div>

        <div className="h-[420px] min-h-0 lg:h-auto">
          <LobbyChat roomCode={roomCode} />
        </div>
      </div>
    </div>
  );
}

export default Lobby;
