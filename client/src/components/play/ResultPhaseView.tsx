import clsx from "clsx";
import Button from "../ui/Button";
import AnswerResultButton from "./AnswerResultButton";
import QuestionTimer from "./QuestionTimer";
import type {
  PublicAnswer,
  QuestionRevealPayload,
  QuestionResult,
} from "../../entities/socket";

interface ResultPhaseViewProps {
  isHost: boolean;
  reveal: QuestionRevealPayload;
  ownResult: QuestionResult | undefined;
  correctAnswersCount: number;
  answers: PublicAnswer[];
  selectedAnswerId: string | null;
  autoAdvanceRemaining: number;
  autoAdvanceTotalSeconds: number;
  onShowLeaderboard: () => void;
}

function ResultPhaseView({
  isHost,
  reveal,
  ownResult,
  correctAnswersCount,
  answers,
  selectedAnswerId,
  autoAdvanceRemaining,
  autoAdvanceTotalSeconds,
  onShowLeaderboard,
}: ResultPhaseViewProps) {
  return (
    <>
      <p
        className={clsx(
          "text-center text-lg font-bold",
          isHost
            ? "text-muted"
            : ownResult?.correct
              ? "text-secondary"
              : "text-danger",
        )}
      >
        {isHost
          ? `${correctAnswersCount} of ${reveal.results.length} answered correctly`
          : ownResult?.correct
            ? `Correct! +${ownResult.pointsAwarded} points`
            : "Incorrect — +0 points"}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {answers.map((answer) => (
          <AnswerResultButton
            key={answer.id}
            text={answer.text}
            isCorrect={reveal.correctAnswerIds.includes(answer.id)}
            isOwnAnswer={selectedAnswerId === answer.id}
            count={
              reveal.results.filter((result) => result.answerId === answer.id)
                .length
            }
            totalResponses={reveal.results.length}
          />
        ))}
      </div>

      {isHost ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-40">
            <QuestionTimer
              remainingSeconds={autoAdvanceRemaining}
              totalSeconds={autoAdvanceTotalSeconds}
            />
          </div>
          <Button type="button" onClick={onShowLeaderboard}>
            Show Leaderboard
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted">Waiting for host...</p>
      )}
    </>
  );
}

export default ResultPhaseView;
