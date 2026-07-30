import clsx from "clsx";
import type { RecentGame } from "../../lib/dashboard";

interface RecentGameRowProps {
  game: RecentGame;
}

function RecentGameRow({ game }: RecentGameRowProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-chat">
        {game.quizCoverImage ? (
          <img
            src={game.quizCoverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-muted">
            {game.quizTitle.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-semibold text-foreground">
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
