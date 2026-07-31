import { useLocation, useParams } from "react-router-dom";
import clsx from "clsx";
import { ROOM_CODE_REGEX } from "shared";
import RoomNotFound from "../components/lobby/RoomNotFound";
import HostDisconnected from "../components/lobby/HostDisconnected";
import ReconnectingOverlay from "../components/lobby/ReconnectingOverlay";
import HostReconnectingBanner from "../components/lobby/HostReconnectingBanner";
import HostLobbyPanel from "../components/lobby/HostLobbyPanel";
import ParticipantLobbyPanel from "../components/lobby/ParticipantLobbyPanel";
import ChatPanel from "../components/lobby/ChatPanel";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useSocket } from "../context/useSocket";
import { usePlayJoinFlow, type LobbyLocationState } from "../hooks/usePlayJoinFlow";
import { useRoomPresence } from "../hooks/useRoomPresence";
import { resolveLobbyBlockingState } from "../lib/resolveLobbyBlockingState";

interface LobbyLocation {
  state?: LobbyLocationState;
}

function Lobby() {
  const { roomCode } = useParams();
  const { state } = useLocation() as LobbyLocation;
  const { socket } = useSocket();

  const isValidRoomCode =
    !!roomCode && ROOM_CODE_REGEX.test(roomCode.toUpperCase());
  const isOnline = useOnlineStatus();

  const { session, players, roomNotFound, joinRejection } = usePlayJoinFlow({
    roomCode,
    isValidRoomCode,
    state,
  });

  const isHost = state?.isHost ?? session?.isHost ?? false;

  const { hostDisconnected, hostReconnecting, chatDisabled } = useRoomPresence({
    roomCode,
    isHost,
  });

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

  const blockingState = resolveLobbyBlockingState({
    isValidRoomCode,
    roomNotFound,
    session,
    joinRejection,
    hostDisconnected,
  });

  if (blockingState) {
    switch (blockingState.screen) {
      case "room-not-found":
        return <RoomNotFound roomCode={roomCode} />;
      case "room-full":
        return (
          <RoomNotFound
            roomCode={roomCode}
            title="Room is full"
            message="This room has reached its player limit."
          />
        );
      case "late-join-disabled":
        return (
          <RoomNotFound
            roomCode={roomCode}
            title="Game already in progress"
            message="This game has already started and isn't accepting new players."
          />
        );
      case "host-disconnected":
        return <HostDisconnected />;
    }
  }

  if (!roomCode) {
    return <RoomNotFound roomCode={roomCode} />;
  }

  const displayName = state?.name ?? session?.name ?? "Guest";
  const displayColor = state?.color ?? session?.color;
  const isMuted = players.find((p) => p.id === session?.token)?.muted ?? false;

  return (
    <div className="page-shell px-4 py-10">
      {!isOnline && <ReconnectingOverlay />}

      <h1 className="heading mb-8 text-center text-2xl">
        Quiz<span className="text-primary">zly</span>
      </h1>

      <HostReconnectingBanner show={hostReconnecting && !isHost} />

      <div
        className={clsx(
          "mx-auto grid w-full max-w-5xl gap-6",
          !chatDisabled && "lg:grid-cols-[1fr_320px]",
        )}
      >
        <div className="card-lg flex flex-col items-center justify-center bg-surface/40 px-6 py-10">
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
          <ChatPanel
            roomCode={roomCode}
            disabled={isMuted}
            disabledReason={isMuted ? "You have been muted by the host." : undefined}
          />
        )}
      </div>
    </div>
  );
}

export default Lobby;
