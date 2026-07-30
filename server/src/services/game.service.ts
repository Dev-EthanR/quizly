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
  | { phase: "ended"; leaderboard: LeaderboardEntry[]; totalQuestions: number };

interface QuizWithQuestions {
  questions: {
    id: string;
    prompt: string;
    timeLimitSeconds: number;
    points: number;
    answers: { id: string; text: string; isCorrect: boolean }[];
  }[];
}

function toGameQuestions(quiz: QuizWithQuestions): GameQuestion[] {
  return quiz.questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    timeLimitSeconds: question.timeLimitSeconds,
    points: question.points,
    answers: shuffleArray(
      question.answers.map(({ id, text, isCorrect }) => ({ id, text, isCorrect })),
    ),
  }));
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
    correctAnswerIds: question.answers.filter((a) => a.isCorrect).map((a) => a.id),
    results,
    leaderboard: buildLeaderboard(room, game),
  };
}

async function persistGameHistory(
  room: RoomRecord,
  game: GameState,
  leaderboard: LeaderboardEntry[],
) {
  if (!room.hostUserId && !room.players.some((player) => player.userId)) {
    return;
  }

  const participants: GamePlayedRecord[] = [];
  leaderboard.forEach((entry, index) => {
    const player = room.players.find((p) => p.token === entry.playerId);
    if (!player?.userId) {
      return;
    }

    const answeredCount = game.answeredCounts[entry.playerId] ?? 0;
    const avgAnswerMs =
      answeredCount > 0
        ? Math.round((game.answerTimeTotals[entry.playerId] ?? 0) / answeredCount)
        : 0;

    participants.push({
      userId: player.userId,
      score: entry.score,
      rank: index + 1,
      totalPlayers: leaderboard.length,
      correctCount: entry.correctCount,
      avgAnswerMs,
      won: index === 0,
    });
  });

  await gameHistoryRepository.recordGameSession({
    quizId: room.quizId,
    hostUserId: room.hostUserId,
    playerCount: room.players.length,
    questionCount: game.questions.length,
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
      questions: toGameQuestions(quiz),
      currentQuestionIndex: 0,
      phase: "question",
      questionStartedAt: Date.now(),
      answers: [],
      scores: {},
      correctCounts: {},
      answerTimeTotals: {},
      answeredCounts: {},
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

    return buildRevealPayload(room, game);
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
      game.phase = "ended";
      const leaderboard = buildLeaderboard(room, game);
      await Promise.all([
        quizzesRepository.incrementPlayCount(room.quizId),
        persistGameHistory(room, game, leaderboard),
      ]);
      return {
        ended: true as const,
        leaderboard,
        totalQuestions: game.questions.length,
      };
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
        leaderboard: buildLeaderboard(room, game),
        totalQuestions: game.questions.length,
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
