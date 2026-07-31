import { useLocation, useParams } from "react-router-dom";
import RoomNotFound from "../components/lobby/RoomNotFound";
import HostDisconnected from "../components/lobby/HostDisconnected";
import ReconnectingOverlay from "../components/lobby/ReconnectingOverlay";
import HostReconnectingBanner from "../components/lobby/HostReconnectingBanner";
import HostLobbyPanel from "../components/lobby/HostLobbyPanel";
import ParticipantLobbyPanel from "../components/lobby/ParticipantLobbyPanel";
import RoomChatLayout from "../components/lobby/RoomChatLayout";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useSocket } from "../context/useSocket";
import { usePlayJoinFlow, type LobbyLocationState } from "../hooks/usePlayJoinFlow";
import { useRoomPresence } from "../hooks/useRoomPresence";
import { useRoomModerationActions } from "../hooks/useRoomModerationActions";
import { resolveLobbyBlockingState } from "../lib/resolveLobbyBlockingState";
import { isValidRoomCode } from "../lib/roomCode";

interface LobbyLocation {
  state?: LobbyLocationState;
}

function Lobby() {
  const { roomCode } = useParams();
  const { state } = useLocation() as LobbyLocation;
  const { socket, status } = useSocket();

  const roomCodeValid = isValidRoomCode(roomCode);
  const isOnline = useOnlineStatus();
  const isReconnecting = !isOnline || status !== "connected";

  const { session, players, roomNotFound, joinRejection } = usePlayJoinFlow({
    roomCode,
    isValidRoomCode: roomCodeValid,
    state,
  });

  const isHost = state?.isHost ?? session?.isHost ?? false;

  const { hostDisconnected, hostReconnecting, chatDisabled } = useRoomPresence({
    roomCode,
    isHost,
  });

  const { kickPlayer, setPlayerMuted } = useRoomModerationActions(roomCode);

  const handleStartGame = () => {
    if (!roomCode) {
      return;
    }
    socket.emit("start_game", { roomCode });
  };

  const blockingState = resolveLobbyBlockingState({
    isValidRoomCode: roomCodeValid,
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

  return (
    <div className="page-shell px-4 py-10">
      {isReconnecting && <ReconnectingOverlay />}

      <h1 className="heading mb-8 text-center text-2xl">
        Quiz<span className="text-primary">zly</span>
      </h1>

      <HostReconnectingBanner show={hostReconnecting && !isHost} />

      <RoomChatLayout
        roomCode={roomCode}
        chatDisabled={chatDisabled}
        players={players}
        currentPlayerId={session?.token}
      >
        <div className="card-lg flex flex-col items-center justify-center bg-surface/40 px-6 py-10">
          {isHost ? (
            <HostLobbyPanel
              roomCode={roomCode}
              players={players}
              onStartGame={handleStartGame}
              onKick={kickPlayer}
              onSetMuted={setPlayerMuted}
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
      </RoomChatLayout>
    </div>
  );
}

export default Lobby;
