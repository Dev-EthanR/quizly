import type { QuizCategory } from "./quiz";

export type GamePhase = "question" | "result" | "leaderboard" | "ended";

export interface RoomCreatedPayload {
  roomCode: string;
}

export interface JoinRejectedPayload {
  roomCode: string;
  reason: "late_join_disabled" | "room_full";
}

export interface RoomSettingsPayload {
  disableChat: boolean;
  maxPlayers: number | null;
}

export interface PublicAnswer {
  id: string;
  text: string;
}

export interface PublicQuestion {
  id: string;
  prompt: string;
  timeLimitSeconds: number;
  points: number;
  category: QuizCategory | null;
  answers: PublicAnswer[];
}

export interface GameStartedPayload {
  roomCode: string;
  questionIndex: number;
  totalQuestions: number;
  question: PublicQuestion;
  startedAt: number;
}

export interface QuestionStartedPayload {
  questionIndex: number;
  totalQuestions: number;
  question: PublicQuestion;
  startedAt: number;
}

export interface AnswerProgressPayload {
  answered: number;
  total: number;
}

export interface QuestionResult {
  playerId: string;
  name: string;
  answerId: string | null;
  correct: boolean;
  pointsAwarded: number;
  totalScore: number;
}

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  score: number;
  correctCount: number;
  connected: boolean;
}

export interface QuestionRevealPayload {
  questionIndex: number;
  correctAnswerIds: string[];
  results: QuestionResult[];
  leaderboard: LeaderboardEntry[];
}

export interface PlayerSummaryEntry extends LeaderboardEntry {
  color?: string;
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

export type RoomStatePayload =
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

export interface LobbyPlayer {
  id: string;
  name: string;
  color?: string;
  connected: boolean;
  muted: boolean;
}

export interface LobbyPlayersPayload {
  players: LobbyPlayer[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: string;
  isHost: boolean;
  message: string;
  sentAt: number;
}
