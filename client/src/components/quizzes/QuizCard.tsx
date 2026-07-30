import { Link } from "react-router-dom";
import QuizStatusBadge from "./QuizStatusBadge";
import HostQuizButton from "./HostQuizButton";
import ImageFallback from "../ui/ImageFallback";
import TagPill from "../ui/TagPill";
import type { Quiz } from "../../entities/quiz";

interface QuizCardProps {
  quiz: Quiz;
}

function QuizCard({ quiz }: QuizCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary sm:flex-row sm:items-center">
      <Link
        to={`/quizzes/${quiz.id}/edit`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <ImageFallback
          src={quiz.coverImage}
          fallbackText={quiz.title}
          className="h-16 w-24"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">
              {quiz.title}
            </h3>
            <QuizStatusBadge status={quiz.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
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
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </Link>

      <HostQuizButton
        quizId={quiz.id}
        className="flex w-full items-center justify-center gap-2 shrink-0 sm:w-auto"
      />
    </div>
  );
}

export default QuizCard;
