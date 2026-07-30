import clsx from "clsx";
import { formatResponseTime } from "../../lib/format";

interface QuestionBreakdownRowProps {
  index: number;
  prompt: string;
  accuracy: number;
  avgResponseMs: number;
}

function accuracyBarColor(accuracy: number): string {
  if (accuracy >= 70) return "bg-secondary";
  if (accuracy >= 40) return "bg-warning";
  return "bg-danger";
}

function accuracyTextColor(accuracy: number): string {
  if (accuracy >= 70) return "text-secondary";
  if (accuracy >= 40) return "text-warning";
  return "text-danger";
}

function QuestionBreakdownRow({
  index,
  prompt,
  accuracy,
  avgResponseMs,
}: QuestionBreakdownRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        {index + 1}
      </span>
      <span className="max-w-[40%] shrink-0 truncate text-sm text-foreground">
        {prompt}
      </span>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-background">
        <div
          className={clsx("h-full rounded-full", accuracyBarColor(accuracy))}
          style={{ width: `${accuracy}%` }}
        />
      </div>
      <span
        className={clsx(
          "shrink-0 text-sm font-semibold",
          accuracyTextColor(accuracy),
        )}
      >
        {accuracy}%
      </span>
      <span className="shrink-0 text-sm text-muted">
        {formatResponseTime(avgResponseMs)}
      </span>
    </li>
  );
}

export default QuestionBreakdownRow;
