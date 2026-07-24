import clsx from "clsx";
import type { KeyboardEvent, MouseEvent } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { QuizQuestionDraft } from "../../lib/quizzes";
import { isQuestionValid } from "../../lib/questionValidation";

interface QuestionCardProps {
  question: QuizQuestionDraft;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

function QuestionCard({
  question,
  index,
  isSelected,
  onSelect,
  onEdit,
  onRemove,
}: QuestionCardProps) {
  const incomplete = !isQuestionValid(question);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEdit();
  };

  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={clsx(
        "flex cursor-pointer items-center gap-3 rounded-xl border bg-surface p-4 transition-colors",
        isSelected
          ? "border-primary ring-1 ring-primary/40"
          : "border-border hover:border-primary/40",
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-xs font-bold text-primary">
        {index + 1}
      </span>

      <div className="flex flex-1 flex-col gap-1">
        <span className="font-medium text-foreground">
          {question.prompt.trim() || "Untitled question"}
        </span>
        <span className="text-xs text-muted">
          {question.answers.length} options · {question.timeLimitSeconds}s ·{" "}
          {question.points} pts
          {incomplete && (
            <span className="ml-2 font-semibold text-danger">Incomplete</span>
          )}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          aria-label="Edit question"
          title="Edit question"
          onClick={handleEditClick}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary transition-colors hover:border-violet-400/60 hover:bg-violet-400/15 hover:text-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <FiEdit2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Delete question"
          title="Delete question"
          onClick={handleRemoveClick}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-danger/40 bg-danger/10 text-danger transition-colors hover:border-red-400/60 hover:bg-red-400/15 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default QuestionCard;
