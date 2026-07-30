import { useState } from "react";
import clsx from "clsx";
import { FiX } from "react-icons/fi";
import Avatar from "../ui/Avatar";
import ConfirmDialog from "../ui/ConfirmDialog";
import { AVATAR_COLORS } from "../../lib/avatarColors";
import { getInitials } from "../../lib/initials";
import type { LobbyPlayer } from "../../context/socket-context";

interface PlayerRosterProps {
  players: LobbyPlayer[];
  currentPlayerId?: string | undefined;
  emptyMessage?: string;
  onKick?: (playerId: string) => void;
}

function PlayerRoster({
  players,
  currentPlayerId,
  emptyMessage = "Waiting for players to join...",
  onKick,
}: PlayerRosterProps) {
  const [pendingKick, setPendingKick] = useState<LobbyPlayer | null>(null);

  if (players.length === 0) {
    return <p className="text-muted">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="flex w-full flex-wrap justify-center gap-4">
        {players.map((player) => {
          const color =
            AVATAR_COLORS.find((c) => c.id === player.color) ??
            AVATAR_COLORS[0];
          const isYou = player.id === currentPlayerId;
          const canKick = !!onKick && !isYou;

          return (
            <div
              key={player.id}
              className="group flex w-20 flex-col items-center gap-2"
            >
              <div className="relative">
                <Avatar
                  initials={getInitials(player.name)}
                  bgClass={color.bgClass}
                />
                {!player.connected && (
                  <span
                    className="absolute inset-0 rounded-full bg-background/60"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={clsx(
                    "absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-surface",
                    player.connected ? "bg-secondary" : "bg-muted",
                  )}
                  aria-hidden="true"
                />
                {canKick && (
                  <button
                    type="button"
                    aria-label={`Kick ${player.name}`}
                    onClick={() => setPendingKick(player)}
                    className="absolute -top-1 -right-1 hidden h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 border-surface bg-danger text-white group-hover:flex"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p
                className={clsx(
                  "w-full truncate text-sm",
                  isYou ? "font-semibold text-primary" : "text-foreground",
                )}
              >
                {player.name}
                {isYou && " (You)"}
              </p>
              {!player.connected && (
                <p className="text-xs text-muted">Reconnecting...</p>
              )}
            </div>
          );
        })}
      </div>

      {pendingKick && (
        <ConfirmDialog
          title="Kick player"
          message={`Remove ${pendingKick.name} from this game? They won't be able to rejoin with this link.`}
          confirmLabel="Kick"
          onConfirm={() => {
            onKick?.(pendingKick.id);
            setPendingKick(null);
          }}
          onCancel={() => setPendingKick(null)}
        />
      )}
    </>
  );
}

export default PlayerRoster;
