import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import clsx from "clsx";
import { quizCategoryLabels, quizDifficultyLabels, type QuizDifficulty } from "shared";
import Button from "../ui/Button";
import type { DiscoverQuiz } from "../../lib/quizzes";

interface DiscoveryQuizCardProps {
  quiz: DiscoverQuiz;
}

const DIFFICULTY_BADGE_CLASS: Record<QuizDifficulty, string> = {
  easy: "bg-secondary/90",
  medium: "bg-warning/90",
  hard: "bg-danger/90",
};

function DiscoveryQuizCard({ quiz }: DiscoveryQuizCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary">
      <div className="relative flex h-36 items-center justify-center bg-chat">
        {quiz.coverImage ? (
          <img
            src={quiz.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-muted">
            {quiz.title.charAt(0).toUpperCase()}
          </span>
        )}

        {quiz.category && (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
            {quizCategoryLabels[quiz.category]}
          </span>
        )}

        {quiz.difficulty && (
          <span
            className={clsx(
              "absolute bottom-2 right-2 rounded-full px-2.5 py-1 text-xs font-semibold text-white",
              DIFFICULTY_BADGE_CLASS[quiz.difficulty],
            )}
          >
            {quizDifficultyLabels[quiz.difficulty]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-semibold text-foreground">{quiz.title}</h3>

        <div className="flex items-center gap-2 text-sm text-muted">
          {quiz.ownerImage ? (
            <img
              src={quiz.ownerImage}
              alt=""
              referrerPolicy="no-referrer"
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chat text-xs font-bold text-muted">
              {(quiz.ownerName ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate">{quiz.ownerName ?? "Unknown host"}</span>
        </div>

        {quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quiz.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <hr className="mt-auto border-border" />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>#{quiz.questionCount} Qs</span>
            <span className="flex items-center gap-1">
              <FiPlay className="h-3.5 w-3.5" />
              {quiz.playCount} {quiz.playCount === 1 ? "play" : "plays"}
            </span>
          </div>

          <Link to={`/host/${quiz.id}`}>
            <Button type="button" className="flex items-center gap-2">
              <FiPlay className="h-4 w-4" />
              Host
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DiscoveryQuizCard;
