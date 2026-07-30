import { DASHBOARD_LIST_PAGE_SIZE } from "shared";
import {
  gameHistoryRepository,
  type QuestionBreakdownRecord,
} from "../repositories/gameHistory.repository.js";

const PARTY_HOST_TARGET = 20;
const MEGA_HOST_TARGET = 50;
const ON_FIRE_TARGET = 3;
const HOT_STREAK_TARGET = 5;
const UNSTOPPABLE_TARGET = 10;
const QUIZ_MASTER_TARGET = 25;
const RISING_HOST_TARGET = 10;
const SPEED_DEMON_MAX_AVG_MS = 3000;
const LIGHTNING_MAX_AVG_MS = 1500;
const VETERAN_TARGET = 10;
const CENTURION_TARGET = 100;
const SHARPSHOOTER_TARGET = 5;
const VETERAN_CHAMPION_WINS_TARGET = 10;
const UNDERDOG_MIN_PLAYERS = 10;

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

export interface HostedSessionPlayerSummary {
  playerId: string;
  name: string;
  color?: string | undefined;
  score: number;
  correctCount: number;
  connected: boolean;
  accuracy: number;
  avgResponseMs: number;
}

export interface HostedSessionFastestPlayer {
  playerId: string;
  name: string;
  avgResponseMs: number;
}

export interface HostedSessionHardestQuestion {
  questionIndex: number;
  prompt: string;
  accuracy: number;
}

export interface HostedSessionDetail {
  quizTitle: string;
  quizCoverImage: string | null;
  playedAt: Date;
  leaderboard: HostedSessionPlayerSummary[];
  totalQuestions: number;
  totalPlayers: number;
  averageAccuracy: number;
  averageResponseMs: number;
  completionRate: number;
  questionBreakdown: QuestionBreakdownRecord[];
  fastestPlayer: HostedSessionFastestPlayer | null;
  hardestQuestion: HostedSessionHardestQuestion | null;
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
    const totalScore = playedRows.reduce((sum, row) => sum + row.score, 0);
    const averageScore =
      gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;
    const bestFinish =
      gamesPlayed > 0 ? Math.min(...playedRows.map((row) => row.rank)) : null;
    const wins = playedRows.filter((row) => row.won).length;

    const perfectScoreCount = playedRows.filter(
      (row) => row.questionCount > 0 && row.correctCount === row.questionCount,
    ).length;
    const hasSpeedDemon = playedRows.some(
      (row) => row.avgAnswerMs > 0 && row.avgAnswerMs < SPEED_DEMON_MAX_AVG_MS,
    );
    const hasLightningReflexes = playedRows.some(
      (row) => row.avgAnswerMs > 0 && row.avgAnswerMs < LIGHTNING_MAX_AVG_MS,
    );
    const hasPodiumFinish = playedRows.some((row) => row.rank <= 3);
    const hasRunnerUp = playedRows.some((row) => row.rank === 2);
    const hasUnderdogWin = playedRows.some(
      (row) => row.won && row.totalPlayers >= UNDERDOG_MIN_PLAYERS,
    );
    const hasFlawlessVictory = playedRows.some(
      (row) => row.won && row.questionCount > 0 && row.correctCount === row.questionCount,
    );
    const bestWinStreak = longestWinStreak(playedRows);

    const hostedCount = hostedSessions.length;
    const maxPartySize = hostedSessions.reduce(
      (max, session) => Math.max(max, session.playerCount),
      0,
    );

    const achievements: Achievement[] = [
      {
        id: "rookie",
        title: "Rookie",
        description: "Play your first game",
        unlocked: gamesPlayed >= 1,
        progress: Math.min(gamesPlayed, 1),
        target: 1,
      },
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
        unlocked: perfectScoreCount >= 1,
        progress: Math.min(perfectScoreCount, 1),
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
        id: "lightning_reflexes",
        title: "Lightning Reflexes",
        description: "Average under 1.5 seconds per answer in a game",
        unlocked: hasLightningReflexes,
        progress: hasLightningReflexes ? 1 : 0,
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
        id: "mega_host",
        title: "Mega Host",
        description: `Host a game with ${MEGA_HOST_TARGET} or more players`,
        unlocked: maxPartySize >= MEGA_HOST_TARGET,
        progress: Math.min(maxPartySize, MEGA_HOST_TARGET),
        target: MEGA_HOST_TARGET,
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
        id: "hot_streak",
        title: "Hot Streak",
        description: `Win ${HOT_STREAK_TARGET} games in a row`,
        unlocked: bestWinStreak >= HOT_STREAK_TARGET,
        progress: Math.min(bestWinStreak, HOT_STREAK_TARGET),
        target: HOT_STREAK_TARGET,
      },
      {
        id: "unstoppable",
        title: "Unstoppable",
        description: `Win ${UNSTOPPABLE_TARGET} games in a row`,
        unlocked: bestWinStreak >= UNSTOPPABLE_TARGET,
        progress: Math.min(bestWinStreak, UNSTOPPABLE_TARGET),
        target: UNSTOPPABLE_TARGET,
      },
      {
        id: "quiz_master",
        title: "Quiz Master",
        description: `Host ${QUIZ_MASTER_TARGET} quizzes`,
        unlocked: hostedCount >= QUIZ_MASTER_TARGET,
        progress: Math.min(hostedCount, QUIZ_MASTER_TARGET),
        target: QUIZ_MASTER_TARGET,
      },
      {
        id: "rising_host",
        title: "Rising Host",
        description: `Host ${RISING_HOST_TARGET} quizzes`,
        unlocked: hostedCount >= RISING_HOST_TARGET,
        progress: Math.min(hostedCount, RISING_HOST_TARGET),
        target: RISING_HOST_TARGET,
      },
      {
        id: "veteran",
        title: "Veteran",
        description: `Play ${VETERAN_TARGET} games`,
        unlocked: gamesPlayed >= VETERAN_TARGET,
        progress: Math.min(gamesPlayed, VETERAN_TARGET),
        target: VETERAN_TARGET,
      },
      {
        id: "centurion",
        title: "Centurion",
        description: `Play ${CENTURION_TARGET} games`,
        unlocked: gamesPlayed >= CENTURION_TARGET,
        progress: Math.min(gamesPlayed, CENTURION_TARGET),
        target: CENTURION_TARGET,
      },
      {
        id: "flawless_victory",
        title: "Flawless Victory",
        description: "Win a game with a perfect score",
        unlocked: hasFlawlessVictory,
        progress: hasFlawlessVictory ? 1 : 0,
        target: 1,
      },
      {
        id: "first_host",
        title: "First Host",
        description: "Host your first game",
        unlocked: hostedCount >= 1,
        progress: Math.min(hostedCount, 1),
        target: 1,
      },
      {
        id: "sharpshooter",
        title: "Sharpshooter",
        description: `Get a perfect score in ${SHARPSHOOTER_TARGET} different games`,
        unlocked: perfectScoreCount >= SHARPSHOOTER_TARGET,
        progress: Math.min(perfectScoreCount, SHARPSHOOTER_TARGET),
        target: SHARPSHOOTER_TARGET,
      },
      {
        id: "podium_finish",
        title: "Podium Finish",
        description: "Finish in the top 3 of a game",
        unlocked: hasPodiumFinish,
        progress: hasPodiumFinish ? 1 : 0,
        target: 1,
      },
      {
        id: "runner_up",
        title: "Runner Up",
        description: "Finish 2nd place in a game",
        unlocked: hasRunnerUp,
        progress: hasRunnerUp ? 1 : 0,
        target: 1,
      },
      {
        id: "underdog",
        title: "Underdog",
        description: `Win a game with ${UNDERDOG_MIN_PLAYERS} or more players`,
        unlocked: hasUnderdogWin,
        progress: hasUnderdogWin ? 1 : 0,
        target: 1,
      },
      {
        id: "veteran_champion",
        title: "Veteran Champion",
        description: `Win ${VETERAN_CHAMPION_WINS_TARGET} games total`,
        unlocked: wins >= VETERAN_CHAMPION_WINS_TARGET,
        progress: Math.min(wins, VETERAN_CHAMPION_WINS_TARGET),
        target: VETERAN_CHAMPION_WINS_TARGET,
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

  async getHostedSessionDetail(
    userId: string,
    sessionId: string,
  ): Promise<HostedSessionDetail | null> {
    const session = await gameHistoryRepository.findHostedSessionById(sessionId, userId);
    if (!session) {
      return null;
    }

    const totalQuestions = session.questionCount;
    const totalPlayers = session.participants.length;

    const leaderboard: HostedSessionPlayerSummary[] = session.participants
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map((participant) => ({
        playerId: participant.userId,
        name: participant.name,
        color: participant.color ?? undefined,
        score: participant.score,
        correctCount: participant.correctCount,
        connected: true,
        accuracy:
          totalQuestions > 0
            ? Math.round((participant.correctCount / totalQuestions) * 100)
            : 0,
        avgResponseMs: participant.avgAnswerMs,
      }));

    const averageAccuracy =
      totalPlayers > 0
        ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.accuracy, 0) / totalPlayers)
        : 0;
    const averageResponseMs =
      totalPlayers > 0
        ? Math.round(
            leaderboard.reduce((sum, entry) => sum + entry.avgResponseMs, 0) / totalPlayers,
          )
        : 0;

    const questionBreakdown = (session.questionBreakdown as unknown as
      | QuestionBreakdownRecord[]
      | null) ?? [];

    const fastestPlayer = leaderboard.reduce<HostedSessionPlayerSummary | null>(
      (fastest, entry) =>
        !fastest || entry.avgResponseMs < fastest.avgResponseMs ? entry : fastest,
      null,
    );

    const hardestQuestion = questionBreakdown.reduce<QuestionBreakdownRecord | null>(
      (hardest, question) =>
        !hardest || question.accuracy < hardest.accuracy ? question : hardest,
      null,
    );

    return {
      quizTitle: session.quiz.title,
      quizCoverImage: session.quiz.coverImage,
      playedAt: session.playedAt,
      leaderboard,
      totalQuestions,
      totalPlayers,
      averageAccuracy,
      averageResponseMs,
      completionRate: session.completionRate,
      questionBreakdown,
      fastestPlayer: fastestPlayer
        ? {
            playerId: fastestPlayer.playerId,
            name: fastestPlayer.name,
            avgResponseMs: fastestPlayer.avgResponseMs,
          }
        : null,
      hardestQuestion: hardestQuestion
        ? {
            questionIndex: hardestQuestion.questionIndex,
            prompt: hardestQuestion.prompt,
            accuracy: hardestQuestion.accuracy,
          }
        : null,
    };
  },

  async listHostedSessions(userId: string, page: number) {
    const { sessions, totalCount } =
      await gameHistoryRepository.findHostedSessions(userId, page);

    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        quizId: session.quizId,
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
