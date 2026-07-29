import clsx from "clsx";
import { FiCheck, FiX } from "react-icons/fi";

interface AnswerBreakdownOption {
  id: string;
  text: string;
  count: number;
  isCorrect: boolean;
}

interface HostAnswerBreakdownProps {
  options: AnswerBreakdownOption[];
  totalResponses: number;
}

function HostAnswerBreakdown({ options, totalResponses }: HostAnswerBreakdownProps) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      {options.map((option) => {
        const percent =
          totalResponses > 0 ? Math.round((option.count / totalResponses) * 100) : 0;

        return (
          <div
            key={option.id}
            className={clsx(
              "relative overflow-hidden rounded-xl border-2",
              option.isCorrect ? "border-secondary" : "border-border",
            )}
          >
            <div
              className={clsx(
                "absolute inset-y-0 left-0 transition-[width] duration-500",
                option.isCorrect ? "bg-secondary/20" : "bg-primary/15",
              )}
              style={{ width: `${percent}%` }}
            />
            <div className="relative flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span
                  className={clsx(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    option.isCorrect
                      ? "bg-secondary/20 text-secondary"
                      : "bg-danger/20 text-danger",
                  )}
                >
                  {option.isCorrect ? (
                    <FiCheck className="h-4 w-4" />
                  ) : (
                    <FiX className="h-4 w-4" />
                  )}
                </span>
                {option.text}
              </span>
              <span className="shrink-0 text-sm font-bold text-muted">
                {option.count} ({percent}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default HostAnswerBreakdown;
