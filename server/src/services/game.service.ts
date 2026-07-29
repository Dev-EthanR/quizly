import { quizzesRepository } from "../repositories/quizzes.repository.js";
import {
  roomsRepository,
  type GameQuestion,
  type GameState,
} from "../repositories/rooms.repository.js";

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

interface QuestionOutcome {
  correct: boolean;
  pointsAwarded: number;
}

export interface PublicQuestion {
  id: string;
  prompt: string;
  timeLimitSeconds: number;
  points: number;
  answers: { id: string; text: string }[];
}

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
    answers: question.answers.map(({ id, text, isCorrect }) => ({
      id,
      text,
      isCorrect,
    })),
  }));
}

export function toPublicQuestion(question: GameQuestion): PublicQuestion {
  return {
    id: question.id,
    prompt: question.prompt,
    timeLimitSeconds: question.timeLimitSeconds,
    points: question.points,
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

export const gameService = {
  async startGame({ socketId, roomCode }: StartGameParams) {
    const room = roomsRepository.findByCode(roomCode);
    if (!room || room.hostSocketId !== socketId) {
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
    };

    roomsRepository.setGame(roomCode, game);

    return {
      room,
      question: game.questions[0]!,
      questionIndex: 0,
      totalQuestions: game.questions.length,
      startedAt: game.questionStartedAt,
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

    const isPlayer = room.players.some((p) => p.socketId === socketId);
    if (!isPlayer || game.answers.some((a) => a.socketId === socketId)) {
      return undefined;
    }

    const question = game.questions[questionIndex]!;
    const answeredAt = Date.now();
    game.answers.push({ socketId, answerId, answeredAt });

    const { pointsAwarded } = scoreAnswer(
      question,
      answerId,
      answeredAt - game.questionStartedAt,
    );
    game.scores[socketId] = (game.scores[socketId] ?? 0) + pointsAwarded;

    return {
      answeredCount: game.answers.length,
      totalPlayers: room.players.length,
      allAnswered: game.answers.length >= room.players.length,
    };
  },

  revealQuestion(roomCode: string) {
    const room = roomsRepository.findByCode(roomCode);
    const game = room?.game;
    if (!room || !game || game.phase !== "question") {
      return undefined;
    }

    game.phase = "reveal";
    const question = game.questions[game.currentQuestionIndex]!;

    const results = room.players.map((player) => {
      const answer = game.answers.find((a) => a.socketId === player.socketId);
      const outcome = answer
        ? scoreAnswer(question, answer.answerId, answer.answeredAt - game.questionStartedAt)
        : { correct: false, pointsAwarded: 0 };

      return {
        playerId: player.socketId,
        name: player.name,
        answerId: answer?.answerId ?? null,
        correct: outcome.correct,
        pointsAwarded: outcome.pointsAwarded,
        totalScore: game.scores[player.socketId] ?? 0,
      };
    });

    const leaderboard = room.players
      .map((player) => ({
        playerId: player.socketId,
        name: player.name,
        score: game.scores[player.socketId] ?? 0,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      questionIndex: game.currentQuestionIndex,
      correctAnswerIds: question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.id),
      results,
      leaderboard,
    };
  },

  nextQuestion({ socketId, roomCode }: StartGameParams) {
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
      const leaderboard = room.players
        .map((player) => ({
          playerId: player.socketId,
          name: player.name,
          score: game.scores[player.socketId] ?? 0,
        }))
        .sort((a, b) => b.score - a.score);

      return { ended: true as const, leaderboard };
    }

    game.currentQuestionIndex = nextIndex;
    game.phase = "question";
    game.questionStartedAt = Date.now();
    game.answers = [];

    return {
      ended: false as const,
      question: game.questions[nextIndex]!,
      questionIndex: nextIndex,
      totalQuestions: game.questions.length,
      startedAt: game.questionStartedAt,
    };
  },
};
