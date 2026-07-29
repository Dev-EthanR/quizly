interface PlayerResultScreenProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  rank: number;
  totalPlayers: number;
}

function PlayerResultScreen({
  score,
  correctCount,
  totalQuestions,
  rank,
  totalPlayers,
}: PlayerResultScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-foreground">Game over!</h1>

      <div className="flex flex-col items-center gap-1">
        <span className="text-5xl font-extrabold text-primary">#{rank}</span>
        <span className="text-sm text-muted">out of {totalPlayers} players</span>
      </div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface px-4 py-5">
          <span className="text-2xl font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted">Total points</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface px-4 py-5">
          <span className="text-2xl font-bold text-foreground">
            {correctCount}/{totalQuestions}
          </span>
          <span className="text-xs text-muted">Correct answers</span>
        </div>
      </div>
    </div>
  );
}

export default PlayerResultScreen;
