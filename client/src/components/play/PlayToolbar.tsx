import { FiUsers } from "react-icons/fi";
import QuestionTimer from "./QuestionTimer";
import type { GamePhase } from "../../entities/socket";

interface PlayToolbarProps {
  questionIndex: number;
  totalQuestions: number;
  isHost: boolean;
  phase: GamePhase;
  remainingSeconds: number;
  timeLimitSeconds: number;
  onManagePlayers: () => void;
  onEndQuestion: () => void;
  onEndGame: () => void;
}

function PlayToolbar({
  questionIndex,
  totalQuestions,
  isHost,
  phase,
  remainingSeconds,
  timeLimitSeconds,
  onManagePlayers,
  onEndQuestion,
  onEndGame,
}: PlayToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="field-label">
        Question {questionIndex + 1} of {totalQuestions}
      </span>
      <div className="flex items-center gap-3">
        {isHost && (
          <button
            type="button"
            onClick={onManagePlayers}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            <FiUsers className="h-3.5 w-3.5" />
            Manage players
          </button>
        )}
        {isHost && phase === "question" && (
          <button
            type="button"
            onClick={onEndQuestion}
            className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            End question
          </button>
        )}
        {isHost && (
          <button
            type="button"
            onClick={onEndGame}
            className="cursor-pointer rounded-full border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
          >
            End game
          </button>
        )}
        {phase === "question" && (
          <div className="w-40">
            <QuestionTimer
              remainingSeconds={remainingSeconds}
              totalSeconds={timeLimitSeconds}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayToolbar;
