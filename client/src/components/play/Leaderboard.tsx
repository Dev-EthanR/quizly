import clsx from "clsx";
import type { LeaderboardEntry } from "../../context/socket-context";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string | undefined;
}

function Leaderboard({ entries, currentPlayerId }: LeaderboardProps) {
  return (
    <ol className="flex w-full max-w-md flex-col gap-2">
      {entries.map((entry, index) => (
        <li
          key={entry.playerId}
          className={clsx(
            "flex items-center justify-between rounded-lg border bg-surface px-4 py-3",
            entry.playerId === currentPlayerId ? "border-primary" : "border-border",
          )}
        >
          <span className="flex items-center gap-3">
            <span className="text-sm font-bold text-muted">#{index + 1}</span>
            <span className="font-medium text-foreground">{entry.name}</span>
          </span>
          <span className="font-bold text-primary">{entry.score} pts</span>
        </li>
      ))}
    </ol>
  );
}

export default Leaderboard;
