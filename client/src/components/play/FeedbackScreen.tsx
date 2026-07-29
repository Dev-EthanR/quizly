import clsx from "clsx";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

interface FeedbackScreenProps {
  correct: boolean;
  pointsAwarded: number;
  totalScore: number;
  correctAnswerText?: string | undefined;
}

function FeedbackScreen({
  correct,
  pointsAwarded,
  totalScore,
  correctAnswerText,
}: FeedbackScreenProps) {
  const Icon = correct ? FiCheckCircle : FiXCircle;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <div
        className={clsx(
          "flex h-20 w-20 items-center justify-center rounded-full",
          correct ? "bg-secondary/15 text-secondary" : "bg-danger/15 text-danger",
        )}
      >
        <Icon className="h-10 w-10" />
      </div>
      <h2
        className={clsx(
          "text-3xl font-bold",
          correct ? "text-secondary" : "text-danger",
        )}
      >
        {correct ? "Correct!" : "Incorrect"}
      </h2>
      {!correct && correctAnswerText && (
        <p className="text-muted">
          The correct answer was{" "}
          <span className="font-semibold text-foreground">{correctAnswerText}</span>
        </p>
      )}
      <p className="text-xl font-bold text-primary">
        {correct ? `+${pointsAwarded} points` : "+0 points"}
      </p>
      <p className="text-sm text-muted">
        Total score: <span className="font-bold text-foreground">{totalScore}</span>
      </p>
    </div>
  );
}

export default FeedbackScreen;
