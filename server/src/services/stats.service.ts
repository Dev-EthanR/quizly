import { DASHBOARD_LIST_PAGE_SIZE } from "shared";
import { gameHistoryRepository } from "../repositories/gameHistory.repository.js";

const PARTY_HOST_TARGET = 20;
const ON_FIRE_TARGET = 3;
const QUIZ_MASTER_TARGET = 25;
const SPEED_DEMON_MAX_AVG_MS = 3000;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface DashboardStats {
  gamesPlayed: number;
  averageScore: number;
  bestFinish: number | null;
  wins: number;
  achievements: Achievement[];
}

function longestWinStreak(rows: { won: boolean }[]): number {
  let best = 0;
  let current = 0;
  for (const row of rows) {
    if (row.won) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

export const statsService = {
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const [playedRows, hostedSessions] = await Promise.all([
      gameHistoryRepository.findAllPlayedByUser(userId),
      gameHistoryRepository.findHostedSessionsSummary(userId),
    ]);

    const gamesPlayed = playedRows.length;
    const averageScore =
      gamesPlayed > 0
        ? Math.round(
            playedRows.reduce((sum, row) => sum + row.score, 0) / gamesPlayed,
          )
        : 0;
    const bestFinish =
      gamesPlayed > 0 ? Math.min(...playedRows.map((row) => row.rank)) : null;
    const wins = playedRows.filter((row) => row.won).length;

    const hasPerfectScore = playedRows.some(
      (row) => row.questionCount > 0 && row.correctCount === row.questionCount,
    );
    const hasSpeedDemon = playedRows.some(
      (row) => row.avgAnswerMs > 0 && row.avgAnswerMs < SPEED_DEMON_MAX_AVG_MS,
    );
    const bestWinStreak = longestWinStreak(playedRows);

    const hostedCount = hostedSessions.length;
    const maxPartySize = hostedSessions.reduce(
      (max, session) => Math.max(max, session.playerCount),
      0,
    );

    const achievements: Achievement[] = [
      {
        id: "first_win",
        title: "First Win",
        description: "Win your first game",
        unlocked: wins >= 1,
        progress: Math.min(wins, 1),
        target: 1,
      },
      {
        id: "perfect_score",
        title: "Perfect Score",
        description: "Answer every question correctly in a game",
        unlocked: hasPerfectScore,
        progress: hasPerfectScore ? 1 : 0,
        target: 1,
      },
      {
        id: "speed_demon",
        title: "Speed Demon",
        description: "Average under 3 seconds per answer in a game",
        unlocked: hasSpeedDemon,
        progress: hasSpeedDemon ? 1 : 0,
        target: 1,
      },
      {
        id: "party_host",
        title: "Party Host",
        description: `Host a game with ${PARTY_HOST_TARGET} or more players`,
        unlocked: maxPartySize >= PARTY_HOST_TARGET,
        progress: Math.min(maxPartySize, PARTY_HOST_TARGET),
        target: PARTY_HOST_TARGET,
      },
      {
        id: "on_fire",
        title: "On Fire",
        description: `Win ${ON_FIRE_TARGET} games in a row`,
        unlocked: bestWinStreak >= ON_FIRE_TARGET,
        progress: Math.min(bestWinStreak, ON_FIRE_TARGET),
        target: ON_FIRE_TARGET,
      },
      {
        id: "quiz_master",
        title: "Quiz Master",
        description: `Host ${QUIZ_MASTER_TARGET} quizzes`,
        unlocked: hostedCount >= QUIZ_MASTER_TARGET,
        progress: Math.min(hostedCount, QUIZ_MASTER_TARGET),
        target: QUIZ_MASTER_TARGET,
      },
    ];

    return { gamesPlayed, averageScore, bestFinish, wins, achievements };
  },

  async listRecentGames(userId: string, page: number) {
    const { games, totalCount } = await gameHistoryRepository.findRecentGames(
      userId,
      page,
    );

    return {
      games: games.map((game) => ({
        id: game.id,
        quizTitle: game.session.quiz.title,
        quizCoverImage: game.session.quiz.coverImage,
        score: game.score,
        rank: game.rank,
        totalPlayers: game.totalPlayers,
        correctCount: game.correctCount,
        questionCount: game.questionCount,
        won: game.won,
        playedAt: game.playedAt,
      })),
      page,
      totalPages: Math.max(1, Math.ceil(totalCount / DASHBOARD_LIST_PAGE_SIZE)),
      totalCount,
    };
  },

  async listHostedSessions(userId: string, page: number) {
    const { sessions, totalCount } =
      await gameHistoryRepository.findHostedSessions(userId, page);

    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        quizTitle: session.quiz.title,
        quizCoverImage: session.quiz.coverImage,
        playerCount: session.playerCount,
        questionCount: session.questionCount,
        playedAt: session.playedAt,
      })),
      page,
      totalPages: Math.max(1, Math.ceil(totalCount / DASHBOARD_LIST_PAGE_SIZE)),
      totalCount,
    };
  },
};
