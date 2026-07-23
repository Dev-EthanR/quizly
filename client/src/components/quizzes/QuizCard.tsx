import { Link } from "react-router-dom";
import QuizStatusBadge from "./QuizStatusBadge";
import type { Quiz } from "../../lib/quizzes";

interface QuizCardProps {
  quiz: Quiz;
}

function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Link
      to={`/quizzes/${quiz.id}/edit`}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary"
    >
      <div className="flex h-32 items-center justify-center bg-chat">
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
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{quiz.title}</h3>
          <QuizStatusBadge status={quiz.status} />
        </div>

        <div className="mt-auto flex items-center justify-between text-sm text-muted">
          <span>
            {quiz.questionCount}{" "}
            {quiz.questionCount === 1 ? "question" : "questions"}
          </span>
          <span>Updated {new Date(quiz.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

export default QuizCard;
