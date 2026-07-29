import { useState } from "react";
import { FiCheck, FiCopy, FiUsers } from "react-icons/fi";
import PlayerRoster from "./PlayerRoster";
import type { LobbyPlayer } from "../../context/socket-context";

interface HostLobbyPanelProps {
  roomCode: string;
  players: LobbyPlayer[];
}

const COPIED_RESET_MS = 2000;

function HostLobbyPanel({ roomCode, players }: HostLobbyPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-2xl font-bold text-foreground">You're hosting</h1>
        <p className="text-muted">Players can join with this code</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-8 py-6">
        <span className="text-5xl font-bold tracking-[0.3em] text-primary">
          {roomCode}
        </span>
        <button
          type="button"
          onClick={copyRoomCode}
          aria-label="Copy room code"
          className="cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-chat hover:text-foreground"
        >
          {copied ? (
            <FiCheck className="h-5 w-5" />
          ) : (
            <FiCopy className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm font-medium text-muted">
        <FiUsers className="h-4 w-4" />
        <span>
          {players.length} {players.length === 1 ? "player" : "players"}{" "}
          joined
        </span>
      </div>

      <PlayerRoster players={players} />
    </div>
  );
}

export default HostLobbyPanel;
