import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import { quizCategoryLabels, quizDifficultyLabels } from "shared";
import QuizStatusBadge from "./QuizStatusBadge";
import Button from "../ui/Button";
import type { Quiz } from "../../lib/quizzes";

interface QuizCardProps {
  quiz: Quiz;
}

function QuizCard({ quiz }: QuizCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary">
      <Link
        to={`/quizzes/${quiz.id}/edit`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-chat">
          {quiz.coverImage ? (
            <img
              src={quiz.coverImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-muted">
              {quiz.title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">
              {quiz.title}
            </h3>
            <QuizStatusBadge status={quiz.status} />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            {quiz.category && <span>{quizCategoryLabels[quiz.category]}</span>}
            {quiz.difficulty && (
              <span>{quizDifficultyLabels[quiz.difficulty]}</span>
            )}
            <span>
              {quiz.questionCount}{" "}
              {quiz.questionCount === 1 ? "question" : "questions"}
            </span>
            <span>
              {quiz.playCount} {quiz.playCount === 1 ? "play" : "plays"}
            </span>
            <span>
              Updated {new Date(quiz.updatedAt).toLocaleDateString()}
            </span>
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
        </div>
      </Link>

      <Link to={`/host/${quiz.id}`} className="shrink-0">
        <Button type="button" className="flex items-center gap-2">
          <FiPlay className="h-4 w-4" />
          Host
        </Button>
      </Link>
    </div>
  );
}

export default QuizCard;
