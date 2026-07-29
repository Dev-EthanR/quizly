import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

interface HostLobbyPanelProps {
  roomCode: string;
}

const COPIED_RESET_MS = 2000;

function HostLobbyPanel({ roomCode }: HostLobbyPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-muted">Players can join with this code</p>

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

      <p className="text-muted">Waiting for players to join...</p>
    </div>
  );
}

export default HostLobbyPanel;
