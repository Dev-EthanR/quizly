import { useSocket } from "../context/useSocket";

export interface UseRoomModerationActionsResult {
  kickPlayer: (playerId: string) => void;
  setPlayerMuted: (playerId: string, muted: boolean) => void;
}

export function useRoomModerationActions(
  roomCode: string | undefined,
): UseRoomModerationActionsResult {
  const { socket } = useSocket();

  const kickPlayer = (playerId: string) => {
    if (!roomCode) {
      return;
    }
    socket.emit("kick_player", { roomCode, token: playerId });
  };

  const setPlayerMuted = (playerId: string, muted: boolean) => {
    if (!roomCode) {
      return;
    }
    socket.emit("set_player_muted", { roomCode, token: playerId, muted });
  };

  return { kickPlayer, setPlayerMuted };
}
