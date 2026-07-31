import { useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import QuizStatusBadge from "./QuizStatusBadge";
import HostQuizButton from "./HostQuizButton";
import ImageFallback from "../ui/ImageFallback";
import TagPill from "../ui/TagPill";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useDeleteQuizMutation } from "../../hooks/useDeleteQuizMutation";
import type { Quiz } from "../../entities/quiz";

interface QuizCardProps {
  quiz: Quiz;
}

function QuizCard({ quiz }: QuizCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteQuizMutation = useDeleteQuizMutation();

  return (
    <div className="card flex flex-col gap-4 p-4 transition-colors hover:border-primary sm:flex-row sm:items-center">
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
            <h3 className="truncate-title">
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

          {deleteQuizMutation.isError && (
            <p className="text-sm text-red-500">
              Couldn't delete this quiz. Please try again.
            </p>
          )}
        </div>
      </Link>

      <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
        <HostQuizButton
          quizId={quiz.id}
          className="flex w-full items-center justify-center gap-2 sm:w-auto"
        />

        <button
          type="button"
          aria-label="Delete quiz"
          disabled={deleteQuizMutation.isPending}
          className="cursor-pointer rounded-lg border border-border p-3 text-muted transition-colors hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setIsConfirmingDelete(true)}
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>

      {isConfirmingDelete && (
        <ConfirmDialog
          title="Delete quiz?"
          message={`This will permanently delete "${quiz.title}" and all of its questions. This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            setIsConfirmingDelete(false);
            deleteQuizMutation.mutate(quiz.id);
          }}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      )}
    </div>
  );
}

export default QuizCard;
