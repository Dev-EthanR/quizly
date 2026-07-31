import clsx from "clsx";
import ImageFallback from "../ui/ImageFallback";
import type { RecentGame } from "../../entities/dashboard";

interface RecentGameRowProps {
  game: RecentGame;
}

function RecentGameRow({ game }: RecentGameRowProps) {
  return (
    <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <ImageFallback
        src={game.quizCoverImage}
        fallbackText={game.quizTitle}
        className="h-16 w-24"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate-title">
            {game.quizTitle}
          </h3>
          {game.won && (
            <span className="shrink-0 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-semibold text-secondary">
              Won
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>
            Rank <span className="text-foreground">{game.rank}</span> of{" "}
            {game.totalPlayers}
          </span>
          <span>
            {game.correctCount}/{game.questionCount} correct
          </span>
          <span>{new Date(game.playedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div
        className={clsx(
          "shrink-0 text-right text-2xl font-bold",
          game.won ? "text-secondary" : "text-foreground",
        )}
      >
        {game.score}
        <span className="ml-1 text-sm font-normal text-muted">pts</span>
      </div>
    </div>
  );
}

export default RecentGameRow;
