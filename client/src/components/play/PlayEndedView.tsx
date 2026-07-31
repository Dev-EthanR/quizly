import PodiumScreen from "./PodiumScreen";
import HostSummaryScreen from "./HostSummaryScreen";
import PlayerResultScreen from "./PlayerResultScreen";
import type { GameOverPayload } from "../../entities/socket";
import type { RoomSession } from "../../entities/session";

export interface PlayEndedViewProps {
  gameOver: GameOverPayload | null;
  isHost: boolean;
  session: RoomSession | null;
  showHostSummary: boolean;
  setShowHostSummary: (show: boolean) => void;
}

function PlayEndedView({
  gameOver,
  isHost,
  session,
  showHostSummary,
  setShowHostSummary,
}: PlayEndedViewProps) {
  if (!gameOver) {
    return (
      <div className="page-shell flex items-center justify-center px-4 text-center">
        <p className="text-muted">Tallying final results...</p>
      </div>
    );
  }

  if (isHost) {
    if (showHostSummary) {
      return (
        <HostSummaryScreen summary={gameOver} onBack={() => setShowHostSummary(false)} />
      );
    }
    return (
      <PodiumScreen
        leaderboard={gameOver.leaderboard}
        onViewSummary={() => setShowHostSummary(true)}
      />
    );
  }

  const ownRank = gameOver.leaderboard.findIndex(
    (entry) => entry.playerId === session?.token,
  );
  const ownEntry = ownRank === -1 ? undefined : gameOver.leaderboard[ownRank];

  return (
    <PlayerResultScreen
      score={ownEntry?.score ?? 0}
      correctCount={ownEntry?.correctCount ?? 0}
      totalQuestions={gameOver.totalQuestions}
      rank={ownRank === -1 ? gameOver.leaderboard.length : ownRank + 1}
      totalPlayers={gameOver.leaderboard.length}
    />
  );
}

export default PlayEndedView;
