import clsx from "clsx";

interface QuestionTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
}

const AMBER_THRESHOLD_SECONDS = 5;

function QuestionTimer({ remainingSeconds, totalSeconds }: QuestionTimerProps) {
  const percent =
    totalSeconds > 0
      ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
      : 0;

  const isRed = remainingSeconds <= 0;
  const isAmber = !isRed && remainingSeconds <= AMBER_THRESHOLD_SECONDS;
  const isPurple = !isRed && !isAmber;

  return (
    <div className="flex items-center gap-3">
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface">
        <div
          className={clsx(
            "h-full rounded-full transition-[width] duration-200 ease-linear",
            isPurple && "bg-primary",
            isAmber && "bg-warning",
            isRed && "bg-danger",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        className={clsx(
          "w-10 text-right text-lg font-bold tabular-nums",
          isPurple && "text-primary",
          isAmber && "text-warning",
          isRed && "text-danger",
        )}
      >
        {remainingSeconds}s
      </span>
    </div>
  );
}

export default QuestionTimer;
