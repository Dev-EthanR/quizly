import clsx from "clsx";
import { FiAward } from "react-icons/fi";
import type { LeaderboardEntry } from "../../context/socket-context";

interface PodiumScreenProps {
  leaderboard: LeaderboardEntry[];
}

interface PodiumPlaceProps {
  place: 1 | 2 | 3;
  entry: LeaderboardEntry;
}

const PODIUM_HEIGHT_CLASSES: Record<1 | 2 | 3, string> = {
  1: "h-44",
  2: "h-32",
  3: "h-24",
};

const PODIUM_COLOR_CLASSES: Record<1 | 2 | 3, string> = {
  1: "bg-primary",
  2: "bg-border",
  3: "bg-warning",
};

const PODIUM_ICON_COLOR_CLASSES: Record<1 | 2 | 3, string> = {
  1: "text-primary",
  2: "text-foreground",
  3: "text-warning",
};

function PodiumPlace({ place, entry }: PodiumPlaceProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <FiAward className={clsx("h-8 w-8", PODIUM_ICON_COLOR_CLASSES[place])} />
      <span className="max-w-[7rem] truncate font-semibold text-foreground">
        {entry.name}
      </span>
      <span className="text-sm font-bold text-primary">{entry.score} pts</span>
      <div
        className={clsx(
          "flex w-full items-start justify-center rounded-t-xl pt-3 text-2xl font-extrabold text-white",
          PODIUM_HEIGHT_CLASSES[place],
          PODIUM_COLOR_CLASSES[place],
        )}
      >
        {place}
      </div>
    </div>
  );
}

function PodiumScreen({ leaderboard }: PodiumScreenProps) {
  const [first, second, third, ...rest] = leaderboard;

  return (
    <div className="flex min-h-screen flex-col items-center gap-10 px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground">Final Results</h1>

      <div className="flex w-full max-w-2xl items-end justify-center gap-4">
        {second && <PodiumPlace place={2} entry={second} />}
        {first && <PodiumPlace place={1} entry={first} />}
        {third && <PodiumPlace place={3} entry={third} />}
      </div>

      {rest.length > 0 && (
        <ol className="flex w-full max-w-md flex-col gap-2">
          {rest.map((entry, index) => (
            <li
              key={entry.playerId}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted">#{index + 4}</span>
                <span className="font-medium text-foreground">{entry.name}</span>
              </span>
              <span className="font-bold text-primary">{entry.score} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default PodiumScreen;
