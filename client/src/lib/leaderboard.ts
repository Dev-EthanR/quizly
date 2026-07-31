import type { LeaderboardRankChange, LeaderboardRowEntry } from "../components/play/Leaderboard";
import type { QuestionRevealPayload } from "../entities/socket";

export function computeLeaderboardEntries(
  reveal: QuestionRevealPayload | null,
  questionIndex: number,
): LeaderboardRowEntry[] {
  if (!reveal) {
    return [];
  }

  const previousScoreByPlayer = new Map<string, number>();
  reveal.results.forEach((result) => {
    previousScoreByPlayer.set(result.playerId, result.totalScore - result.pointsAwarded);
  });

  const previousRankByPlayer = new Map<string, number>();
  if (questionIndex > 0) {
    [...reveal.leaderboard]
      .sort(
        (a, b) =>
          (previousScoreByPlayer.get(b.playerId) ?? 0) -
          (previousScoreByPlayer.get(a.playerId) ?? 0),
      )
      .forEach((entry, index) => previousRankByPlayer.set(entry.playerId, index));
  }

  return reveal.leaderboard.map((entry, index) => {
    const pointsGained =
      reveal.results.find((result) => result.playerId === entry.playerId)?.pointsAwarded ?? 0;

    let rankChange: LeaderboardRankChange = "same";
    const previousRank = previousRankByPlayer.get(entry.playerId);
    if (previousRank !== undefined) {
      if (index < previousRank) rankChange = "up";
      else if (index > previousRank) rankChange = "down";
    }

    return { ...entry, pointsGained, rankChange };
  });
}
