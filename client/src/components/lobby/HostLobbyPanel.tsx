import { useState } from "react";
import { FiCheck, FiCopy, FiUsers } from "react-icons/fi";
import Avatar from "../ui/Avatar";
import { AVATAR_COLORS } from "../../lib/avatarColors";
import { getInitials } from "../../lib/initials";
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
    <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
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

      <div className="flex items-center gap-2 text-muted">
        <FiUsers className="h-4 w-4" />
        <span>
          {players.length} {players.length === 1 ? "player" : "players"}{" "}
          joined
        </span>
      </div>

      {players.length === 0 ? (
        <p className="text-muted">Waiting for players to join...</p>
      ) : (
        <div className="flex w-full flex-wrap justify-center gap-4">
          {players.map((player) => {
            const color =
              AVATAR_COLORS.find((c) => c.id === player.color) ??
              AVATAR_COLORS[0];
            return (
              <div
                key={player.id}
                className="flex w-20 flex-col items-center gap-2"
              >
                <Avatar
                  initials={getInitials(player.name)}
                  bgClass={color.bgClass}
                />
                <p className="w-full truncate text-sm text-foreground">
                  {player.name}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HostLobbyPanel;
