import clsx from "clsx";
import { FiCheck, FiX } from "react-icons/fi";

interface AnswerResultButtonProps {
  text: string;
  isCorrect: boolean;
  isOwnAnswer: boolean;
  count: number;
  totalResponses: number;
}

function AnswerResultButton({
  text,
  isCorrect,
  isOwnAnswer,
  count,
  totalResponses,
}: AnswerResultButtonProps) {
  const percent =
    totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;

  return (
    <div
      className={clsx(
        "relative flex items-center gap-4 overflow-hidden rounded-xl border-2 px-6 py-6 text-left text-lg font-semibold text-foreground",
        isCorrect ? "border-secondary" : "border-danger/40",
        isOwnAnswer && "ring-2 ring-primary",
      )}
    >
      <div
        className={clsx(
          "absolute inset-y-0 left-0 transition-[width] duration-500",
          isCorrect ? "bg-secondary/15" : "bg-danger/10",
        )}
        style={{ width: `${percent}%` }}
      />
      <span
        className={clsx(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isCorrect ? "bg-secondary text-white" : "bg-danger/20 text-danger",
        )}
      >
        {isCorrect ? <FiCheck className="h-5 w-5" /> : <FiX className="h-5 w-5" />}
      </span>
      <span className="relative flex-1">{text}</span>
      <span className="relative shrink-0 text-sm font-bold text-muted">
        {count} ({percent}%)
      </span>
    </div>
  );
}

export default AnswerResultButton;
