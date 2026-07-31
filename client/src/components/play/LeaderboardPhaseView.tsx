import Button from "../ui/Button";
import Leaderboard, { type LeaderboardRowEntry } from "./Leaderboard";
import QuestionTimer from "./QuestionTimer";

interface LeaderboardPhaseViewProps {
  entries: LeaderboardRowEntry[];
  currentPlayerId: string | undefined;
  isHost: boolean;
  isFinalQuestion: boolean;
  autoAdvanceRemaining: number;
  autoAdvanceTotalSeconds: number;
  onNextQuestion: () => void;
}

function LeaderboardPhaseView({
  entries,
  currentPlayerId,
  isHost,
  isFinalQuestion,
  autoAdvanceRemaining,
  autoAdvanceTotalSeconds,
  onNextQuestion,
}: LeaderboardPhaseViewProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6">
      <h2 className="heading text-2xl">Leaderboard</h2>
      <Leaderboard entries={entries} currentPlayerId={currentPlayerId} />
      {isHost && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-40">
            <QuestionTimer
              remainingSeconds={autoAdvanceRemaining}
              totalSeconds={autoAdvanceTotalSeconds}
            />
          </div>
          <Button type="button" onClick={onNextQuestion}>
            {isFinalQuestion ? "Finish game" : "Next question"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default LeaderboardPhaseView;
