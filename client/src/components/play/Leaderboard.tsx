import clsx from "clsx";
import { FiArrowDown, FiArrowUp, FiMinus } from "react-icons/fi";
import RankedListRow from "./RankedListRow";

export type LeaderboardRankChange = "up" | "down" | "same";

export interface LeaderboardRowEntry {
  playerId: string;
  name: string;
  score: number;
  pointsGained?: number;
  rankChange?: LeaderboardRankChange;
  connected?: boolean;
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
        <RankedListRow
          key={entry.playerId}
          highlighted={entry.playerId === currentPlayerId}
          left={
            <>
              <span className="text-sm font-bold text-muted">
                #{index + 1}
              </span>
              {entry.rankChange && <RankChangeIcon change={entry.rankChange} />}
              <span className="font-medium text-foreground">{entry.name}</span>
              {entry.connected === false && (
                <span className="text-xs text-muted">(reconnecting)</span>
              )}
            </>
          }
          right={
            <>
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
            </>
          }
        />
      ))}
    </ol>
  );
}

export default Leaderboard;
