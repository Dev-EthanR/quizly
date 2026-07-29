import clsx from "clsx";
import Avatar from "../ui/Avatar";
import { AVATAR_COLORS } from "../../lib/avatarColors";
import { getInitials } from "../../lib/initials";
import type { LobbyPlayer } from "../../context/socket-context";

interface PlayerRosterProps {
  players: LobbyPlayer[];
  currentPlayerId?: string | undefined;
  emptyMessage?: string;
}

function PlayerRoster({
  players,
  currentPlayerId,
  emptyMessage = "Waiting for players to join...",
}: PlayerRosterProps) {
  if (players.length === 0) {
    return <p className="text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="flex w-full flex-wrap justify-center gap-4">
      {players.map((player) => {
        const color =
          AVATAR_COLORS.find((c) => c.id === player.color) ??
          AVATAR_COLORS[0];
        const isYou = player.id === currentPlayerId;

        return (
          <div key={player.id} className="flex w-20 flex-col items-center gap-2">
            <Avatar initials={getInitials(player.name)} bgClass={color.bgClass} />
            <p
              className={clsx(
                "w-full truncate text-sm",
                isYou ? "font-semibold text-primary" : "text-foreground",
              )}
            >
              {player.name}
              {isYou && " (You)"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default PlayerRoster;
