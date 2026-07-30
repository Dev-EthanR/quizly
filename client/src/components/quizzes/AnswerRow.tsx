import clsx from "clsx";
import type { QuizAnswerDraft } from "../../lib/quizzes";
import { useQuizBuilder } from "../../context/useQuizBuilder";
import IndexBadge from "../ui/IndexBadge";

interface AnswerRowProps {
  questionId: string;
  answer: QuizAnswerDraft;
  index: number;
  isCorrect: boolean;
  canRemove: boolean;
  error?: string;
}

function AnswerRow({
  questionId,
  answer,
  index,
  isCorrect,
  canRemove,
  error,
}: AnswerRowProps) {
  const { dispatch } = useQuizBuilder();

  return (
    <div className="flex flex-col gap-1">
      <div
        className={clsx(
          "flex items-center gap-3 rounded-lg border bg-background px-3 py-2 transition-colors",
          isCorrect
            ? "border-secondary"
            : error
              ? "border-danger"
              : "border-border focus-within:border-primary",
        )}
      >
        <button
          type="button"
          aria-label={isCorrect ? "Correct answer" : "Mark as correct answer"}
          onClick={() =>
            dispatch({
              type: "TOGGLE_CORRECT_ANSWER",
              questionId,
              answerId: answer.id,
            })
          }
          className={clsx(
            "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
            isCorrect
              ? "border-secondary bg-secondary text-background"
              : "border-border text-transparent hover:border-secondary/60",
          )}
        >
          ✓
        </button>

        <IndexBadge>{String.fromCharCode(65 + index)}</IndexBadge>

        <input
          value={answer.text}
          placeholder={`Answer ${index + 1}`}
          onChange={(event) =>
            dispatch({
              type: "SET_ANSWER_TEXT",
              questionId,
              answerId: answer.id,
              text: event.target.value,
            })
          }
          className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted placeholder:font-normal focus:outline-none"
        />

        {isCorrect && (
          <span className="shrink-0 text-sm font-semibold text-secondary">
            Correct
          </span>
        )}

        {canRemove && (
          <button
            type="button"
            aria-label="Remove answer"
            onClick={() =>
              dispatch({ type: "REMOVE_ANSWER", questionId, answerId: answer.id })
            }
            className="cursor-pointer rounded-lg px-2 py-1 text-sm text-muted hover:text-danger"
          >
            ✕
          </button>
        )}
      </div>

      {error && <span className="pl-1 text-xs text-danger">{error}</span>}
    </div>
  );
}

export default AnswerRow;
