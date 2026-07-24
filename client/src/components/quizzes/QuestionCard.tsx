import type { QuizQuestionDraft } from "../../lib/quizzes";
import { isQuestionValid } from "../../lib/questionValidation";

interface QuestionCardProps {
  question: QuizQuestionDraft;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}

function QuestionCard({ question, index, onEdit, onRemove }: QuestionCardProps) {
  const incomplete = !isQuestionValid(question);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
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

      <button
        type="button"
        aria-label="Edit question"
        onClick={onEdit}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary/40 hover:bg-primary/15 hover:text-primary"
      >
        ✎
      </button>

      <button
        type="button"
        aria-label="Delete question"
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-danger/40 hover:bg-danger/15 hover:text-danger"
      >
        ✕
      </button>
    </div>
  );
}

export default QuestionCard;
