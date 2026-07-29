import clsx from "clsx";
import { FiArrowDown, FiArrowUp, FiMinus } from "react-icons/fi";

export type LeaderboardRankChange = "up" | "down" | "same";

export interface LeaderboardRowEntry {
  playerId: string;
  name: string;
  score: number;
  pointsGained?: number;
  rankChange?: LeaderboardRankChange;
}

interface LeaderboardProps {
  entries: LeaderboardRowEntry[];
  currentPlayerId?: string | undefined;
}

interface RankChangeIconProps {
  change: LeaderboardRankChange;
}

function RankChangeIcon({ change }: RankChangeIconProps) {
  if (change === "up") {
    return <FiArrowUp className="h-4 w-4 shrink-0 text-secondary" aria-label="Moved up" />;
  }
  if (change === "down") {
    return <FiArrowDown className="h-4 w-4 shrink-0 text-danger" aria-label="Moved down" />;
  }
  return <FiMinus className="h-4 w-4 shrink-0 text-muted" aria-label="No change" />;
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
            {entry.rankChange && <RankChangeIcon change={entry.rankChange} />}
            <span className="font-medium text-foreground">{entry.name}</span>
          </span>
          <span className="flex items-center gap-3">
            {typeof entry.pointsGained === "number" && (
              <span
                className={clsx(
                  "text-xs font-semibold",
                  entry.pointsGained > 0 ? "text-secondary" : "text-muted",
                )}
              >
                {entry.pointsGained > 0 ? `+${entry.pointsGained}` : "+0"}
              </span>
            )}
            <span className="font-bold text-primary">{entry.score} pts</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default Leaderboard;
