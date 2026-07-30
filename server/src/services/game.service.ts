import { quizzesRepository } from "../repositories/quizzes.repository.js";
import { shuffleArray } from "../lib/shuffle.js";
import {
  gameHistoryRepository,
  type GamePlayedRecord,
} from "../repositories/gameHistory.repository.js";
import {
  roomsRepository,
  type GameQuestion,
  type GameState,
  type QuestionStat,
  type RoomRecord,
} from "../repositories/rooms.repository.js";
import type { QuizCategory } from "shared";

const MIN_SCORE_FACTOR = 0.5;

interface StartGameParams {
  socketId: string;
  roomCode: string;
}

interface SubmitAnswerParams {
  socketId: string;
  roomCode: string;
  questionIndex: number;
  answerId: string;
}

interface MarkLeaderboardShownParams {
  socketId: string;
  roomCode: string;
}

interface QuestionOutcome {
  correct: boolean;
  pointsAwarded: number;
}

export interface PublicQuestion {
  id: string;
  prompt: string;
  timeLimitSeconds: number;
  points: number;
  category: QuizCategory | null;
  answers: { id: string; text: string }[];
}

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  score: number;
  correctCount: number;
  connected: boolean;
}

export interface QuestionResult {
  playerId: string;
  name: string;
  answerId: string | null;
  correct: boolean;
  pointsAwarded: number;
  totalScore: number;
}

export interface QuestionRevealPayload {
  questionIndex: number;
  correctAnswerIds: string[];
  results: QuestionResult[];
  leaderboard: LeaderboardEntry[];
}

export interface PlayerSummaryEntry extends LeaderboardEntry {
  color?: string | undefined;
  accuracy: number;
  avgResponseMs: number;
}

export interface QuestionBreakdownEntry {
  questionIndex: number;
  prompt: string;
  correctCount: number;
  totalPlayers: number;
  accuracy: number;
  avgResponseMs: number;
}

export interface FastestPlayerSummary {
  playerId: string;
  name: string;
  avgResponseMs: number;
}

export interface HardestQuestionSummary {
  questionIndex: number;
  prompt: string;
  accuracy: number;
}

export interface GameOverPayload {
  leaderboard: PlayerSummaryEntry[];
  totalQuestions: number;
  totalPlayers: number;
  averageAccuracy: number;
  averageResponseMs: number;
  completionRate: number;
  questionBreakdown: QuestionBreakdownEntry[];
  fastestPlayer: FastestPlayerSummary | null;
  hardestQuestion: HardestQuestionSummary | null;
}

export type RoomState =
  | { phase: "lobby" }
  | {
      phase: "question";
      questionIndex: number;
      totalQuestions: number;
      question: PublicQuestion;
      startedAt: number;
    }
  | {
      phase: "result" | "leaderboard";
      questionIndex: number;
      totalQuestions: number;
      question: PublicQuestion;
      startedAt: number;
      reveal: QuestionRevealPayload;
    }
  | ({ phase: "ended" } & GameOverPayload);

interface QuizWithQuestions {
  questions: {
    id: string;
    prompt: string;
    timeLimitSeconds: number;
    points: number;
    answers: { id: string; text: string; isCorrect: boolean }[];
  }[];
}

function toGameQuestions(
  quiz: QuizWithQuestions,
  randomizeOrder: boolean,
): GameQuestion[] {
  const questions = quiz.questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    timeLimitSeconds: question.timeLimitSeconds,
    points: question.points,
    answers: shuffleArray(
      question.answers.map(({ id, text, isCorrect }) => ({ id, text, isCorrect })),
    ),
  }));

  return randomizeOrder ? shuffleArray(questions) : questions;
}

export function toPublicQuestion(
  question: GameQuestion,
  category: QuizCategory | null,
): PublicQuestion {
  return {
    id: question.id,
    prompt: question.prompt,
    timeLimitSeconds: question.timeLimitSeconds,
    points: question.points,
    category,
    answers: question.answers.map(({ id, text }) => ({ id, text })),
  };
}

export function scoreAnswer(
  question: GameQuestion,
  answerId: string,
  elapsedMs: number,
): QuestionOutcome {
  const answer = question.answers.find((a) => a.id === answerId);
  if (!answer?.isCorrect) {
    return { correct: false, pointsAwarded: 0 };
  }

  const timeLimitMs = question.timeLimitSeconds * 1000;
  const remainingFraction = Math.max(
    0,
    Math.min(1, (timeLimitMs - elapsedMs) / timeLimitMs),
  );
  const factor = MIN_SCORE_FACTOR + (1 - MIN_SCORE_FACTOR) * remainingFraction;

  return { correct: true, pointsAwarded: Math.round(question.points * factor) };
}

function buildLeaderboard(room: RoomRecord, game: GameState): LeaderboardEntry[] {
  return room.players
    .map((player) => ({
      playerId: player.token,
      name: player.name,
      score: game.scores[player.token] ?? 0,
      correctCount: game.correctCounts[player.token] ?? 0,
      connected: player.connected,
    }))
    .sort((a, b) => b.score - a.score);
}

function buildRevealPayload(room: RoomRecord, game: GameState): QuestionRevealPayload {
  const question = game.questions[game.currentQuestionIndex]!;

  const results = room.players.map((player) => {
    const answer = game.answers.find((a) => a.token === player.token);
    const outcome = answer
      ? scoreAnswer(question, answer.answerId, answer.answeredAt - game.questionStartedAt)
      : { correct: false, pointsAwarded: 0 };

    return {
      playerId: player.token,
      name: player.name,
      answerId: answer?.answerId ?? null,
      correct: outcome.correct,
      pointsAwarded: outcome.pointsAwarded,
      totalScore: game.scores[player.token] ?? 0,
    };
  });

  return {
    questionIndex: game.currentQuestionIndex,
    correctAnswerIds: room.settings.showCorrectAnswers
      ? question.answers.filter((a) => a.isCorrect).map((a) => a.id)
      : [],
    results,
    leaderboard: buildLeaderboard(room, game),
  };
}

function buildGameOverSummary(room: RoomRecord, game: GameState): GameOverPayload {
  const totalQuestions = game.questions.length;

  const leaderboard: PlayerSummaryEntry[] = buildLeaderboard(room, game).map((entry) => {
    const player = room.players.find((p) => p.token === entry.playerId);
    const answeredCount = game.answeredCounts[entry.playerId] ?? 0;
    const avgResponseMs =
      answeredCount > 0
        ? Math.round((game.answerTimeTotals[entry.playerId] ?? 0) / answeredCount)
        : 0;

    return {
      ...entry,
      color: player?.color,
      accuracy:
        totalQuestions > 0 ? Math.round((entry.correctCount / totalQuestions) * 100) : 0,
      avgResponseMs,
    };
  });

  const totalPlayers = leaderboard.length;
  const respondedPlayers = leaderboard.filter(
    (entry) => (game.answeredCounts[entry.playerId] ?? 0) > 0,
  );

  const averageAccuracy =
    totalPlayers > 0
      ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.accuracy, 0) / totalPlayers)
      : 0;

  const averageResponseMs =
    respondedPlayers.length > 0
      ? Math.round(
          respondedPlayers.reduce((sum, entry) => sum + entry.avgResponseMs, 0) /
            respondedPlayers.length,
        )
      : 0;

  const totalPossibleAnswers = totalPlayers * totalQuestions;
  const totalActualAnswers = Object.values(game.answeredCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const completionRate =
    totalPossibleAnswers > 0
      ? Math.round((totalActualAnswers / totalPossibleAnswers) * 100)
      : 0;

  const questionBreakdown: QuestionBreakdownEntry[] = game.questionStats.map((stat) => ({
    questionIndex: stat.questionIndex,
    prompt: game.questions[stat.questionIndex]?.prompt ?? "",
    correctCount: stat.correctCount,
    totalPlayers: stat.totalPlayers,
    accuracy:
      stat.totalPlayers > 0 ? Math.round((stat.correctCount / stat.totalPlayers) * 100) : 0,
    avgResponseMs:
      stat.answeredCount > 0 ? Math.round(stat.totalResponseMs / stat.answeredCount) : 0,
  }));

  const fastestPlayer = respondedPlayers.reduce<PlayerSummaryEntry | null>(
    (fastest, entry) =>
      !fastest || entry.avgResponseMs < fastest.avgResponseMs ? entry : fastest,
    null,
  );

  const hardestQuestion = questionBreakdown.reduce<QuestionBreakdownEntry | null>(
    (hardest, question) =>
      !hardest || question.accuracy < hardest.accuracy ? question : hardest,
    null,
  );

  return {
    leaderboard,
    totalQuestions,
    totalPlayers,
    averageAccuracy,
    averageResponseMs,
    completionRate,
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
}

async function endGameSession(room: RoomRecord, game: GameState): Promise<GameOverPayload> {
  game.phase = "ended";
  const summary = buildGameOverSummary(room, game);
  await Promise.all([
    quizzesRepository.incrementPlayCount(room.quizId),
    persistGameHistory(room, summary),
  ]);

  return summary;
}

async function persistGameHistory(room: RoomRecord, summary: GameOverPayload) {
  if (!room.hostUserId && !room.players.some((player) => player.userId)) {
    return;
  }

  const participants: GamePlayedRecord[] = [];
  summary.leaderboard.forEach((entry, index) => {
    const player = room.players.find((p) => p.token === entry.playerId);
    if (!player?.userId) {
      return;
    }

    participants.push({
      userId: player.userId,
      name: entry.name,
      color: entry.color,
      score: entry.score,
      rank: index + 1,
      totalPlayers: summary.leaderboard.length,
      correctCount: entry.correctCount,
      avgAnswerMs: entry.avgResponseMs,
      won: index === 0,
    });
  });

  await gameHistoryRepository.recordGameSession({
    quizId: room.quizId,
    hostUserId: room.hostUserId,
    playerCount: room.players.length,
    questionCount: summary.totalQuestions,
    completionRate: summary.completionRate,
    questionBreakdown: summary.questionBreakdown,
    participants,
  });
}

export const gameService = {
  async startGame({ socketId, roomCode }: StartGameParams) {
    const room = roomsRepository.findByCode(roomCode);
    if (!room || room.hostSocketId !== socketId || room.game) {
      return undefined;
    }

    const quiz = await quizzesRepository.findById(room.quizId);
    if (!quiz || quiz.questions.length === 0) {
      return undefined;
    }

    const game: GameState = {
      questions: toGameQuestions(quiz, room.settings.randomizeQuestionOrder),
      currentQuestionIndex: 0,
      phase: "question",
      questionStartedAt: Date.now(),
      answers: [],
      scores: {},
      correctCounts: {},
      answerTimeTotals: {},
      answeredCounts: {},
      questionStats: [],
      category: quiz.category,
      leaderboardShown: false,
    };

    roomsRepository.setGame(roomCode, game);

    return {
      room,
      question: game.questions[0]!,
      questionIndex: 0,
      totalQuestions: game.questions.length,
      startedAt: game.questionStartedAt,
      category: game.category,
    };
  },

  submitAnswer({ socketId, roomCode, questionIndex, answerId }: SubmitAnswerParams) {
    const room = roomsRepository.findByCode(roomCode);
    const game = room?.game;
    if (
      !room ||
      !game ||
      game.phase !== "question" ||
      game.currentQuestionIndex !== questionIndex
    ) {
      return undefined;
    }

    const player = room.players.find((p) => p.socketId === socketId);
    if (!player || game.answers.some((a) => a.token === player.token)) {
      return undefined;
    }

    const question = game.questions[questionIndex]!;
    const answeredAt = Date.now();
    game.answers.push({ token: player.token, answerId, answeredAt });

    const elapsedMs = answeredAt - game.questionStartedAt;
    const { correct, pointsAwarded } = scoreAnswer(question, answerId, elapsedMs);
    game.scores[player.token] = (game.scores[player.token] ?? 0) + pointsAwarded;
    if (correct) {
      game.correctCounts[player.token] = (game.correctCounts[player.token] ?? 0) + 1;
    }
    game.answerTimeTotals[player.token] =
      (game.answerTimeTotals[player.token] ?? 0) + elapsedMs;
    game.answeredCounts[player.token] =
      (game.answeredCounts[player.token] ?? 0) + 1;

    const connectedPlayers = room.players.filter((p) => p.connected);
    const answeredConnectedCount = game.answers.filter((a) =>
      connectedPlayers.some((p) => p.token === a.token),
    ).length;

    return {
      answeredCount: answeredConnectedCount,
      totalPlayers: connectedPlayers.length,
      allAnswered: answeredConnectedCount >= connectedPlayers.length,
    };
  },

  revealQuestion(roomCode: string): QuestionRevealPayload | undefined {
    const room = roomsRepository.findByCode(roomCode);
    const game = room?.game;
    if (!room || !game || game.phase !== "question") {
      return undefined;
    }

    game.phase = "reveal";
    game.leaderboardShown = false;

    const payload = buildRevealPayload(room, game);

    const stat: QuestionStat = {
      questionIndex: game.currentQuestionIndex,
      correctCount: payload.results.filter((result) => result.correct).length,
      answeredCount: game.answers.length,
      totalPlayers: payload.results.length,
      totalResponseMs: game.answers.reduce(
        (sum, answer) => sum + (answer.answeredAt - game.questionStartedAt),
        0,
      ),
    };
    game.questionStats.push(stat);

    return payload;
  },

  markLeaderboardShown({ socketId, roomCode }: MarkLeaderboardShownParams): boolean {
    const room = roomsRepository.findByCode(roomCode);
    const game = room?.game;
    if (!room || !game || room.hostSocketId !== socketId || game.phase !== "reveal") {
      return false;
    }

    game.leaderboardShown = true;
    return true;
  },

  async nextQuestion({ socketId, roomCode }: StartGameParams) {
    const room = roomsRepository.findByCode(roomCode);
    const game = room?.game;
    if (
      !room ||
      !game ||
      room.hostSocketId !== socketId ||
      game.phase !== "reveal"
    ) {
      return undefined;
    }

    const nextIndex = game.currentQuestionIndex + 1;
    if (nextIndex >= game.questions.length) {
      const summary = await endGameSession(room, game);
      return { ended: true as const, summary };
    }

    game.currentQuestionIndex = nextIndex;
    game.phase = "question";
    game.questionStartedAt = Date.now();
    game.answers = [];
    game.leaderboardShown = false;

    return {
      ended: false as const,
      question: game.questions[nextIndex]!,
      questionIndex: nextIndex,
      totalQuestions: game.questions.length,
      startedAt: game.questionStartedAt,
      category: game.category,
    };
  },

  async endGame({ socketId, roomCode }: StartGameParams) {
    const room = roomsRepository.findByCode(roomCode);
    const game = room?.game;
    if (
      !room ||
      !game ||
      room.hostSocketId !== socketId ||
      game.phase === "ended"
    ) {
      return undefined;
    }

    return endGameSession(room, game);
  },

  getRoomState(roomCode: string): RoomState | undefined {
    const room = roomsRepository.findByCode(roomCode);
    if (!room) {
      return undefined;
    }

    const game = room.game;
    if (!game) {
      return { phase: "lobby" };
    }

    if (game.phase === "ended") {
      return {
        phase: "ended",
        ...buildGameOverSummary(room, game),
      };
    }

    const question = game.questions[game.currentQuestionIndex]!;
    const publicQuestion = toPublicQuestion(question, game.category);

    if (game.phase === "question") {
      return {
        phase: "question",
        questionIndex: game.currentQuestionIndex,
        totalQuestions: game.questions.length,
        question: publicQuestion,
        startedAt: game.questionStartedAt,
      };
    }

    return {
      phase: game.leaderboardShown ? "leaderboard" : "result",
      questionIndex: game.currentQuestionIndex,
      totalQuestions: game.questions.length,
      question: publicQuestion,
      startedAt: game.questionStartedAt,
      reveal: buildRevealPayload(room, game),
    };
  },
};
