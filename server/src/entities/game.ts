import type { QuizCategory } from "shared";

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
