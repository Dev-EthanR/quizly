import type { QuizCategory } from "shared";

export interface PlayerRecord {
  token: string;
  socketId: string | null;
  connected: boolean;
  name: string;
  color?: string | undefined;
  userId?: string | undefined;
  muted: boolean;
}

export interface RoomSettings {
  randomizeQuestionOrder: boolean;
  allowLateJoins: boolean;
  showCorrectAnswers: boolean;
  disableChat: boolean;
  maxPlayers: number | null;
}

export interface GameAnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface GameQuestion {
  id: string;
  prompt: string;
  timeLimitSeconds: number;
  points: number;
  answers: GameAnswerOption[];
}

export interface QuestionAnswer {
  token: string;
  answerId: string;
  answeredAt: number;
}

export interface QuestionStat {
  questionIndex: number;
  correctCount: number;
  answeredCount: number;
  totalPlayers: number;
  totalResponseMs: number;
}

export type GamePhase = "question" | "reveal" | "ended";

export interface GameState {
  questions: GameQuestion[];
  currentQuestionIndex: number;
  phase: GamePhase;
  questionStartedAt: number;
  answers: QuestionAnswer[];
  scores: Record<string, number>;
  correctCounts: Record<string, number>;
  answerTimeTotals: Record<string, number>;
  answeredCounts: Record<string, number>;
  questionStats: QuestionStat[];
  category: QuizCategory | null;
  leaderboardShown: boolean;
}

export interface RoomRecord {
  code: string;
  hostToken: string;
  hostSocketId: string | null;
  hostConnected: boolean;
  hostUserId?: string | undefined;
  quizId: string;
  createdAt: number;
  players: PlayerRecord[];
  game?: GameState | undefined;
  settings: RoomSettings;
}

export interface RoomParticipant {
  roomCode: string;
  token: string;
  name: string;
  color?: string | undefined;
  isHost: boolean;
}

export type JoinRoomResult =
  | { ok: true; room: RoomRecord }
  | { ok: false; reason: "not_found" | "late_join_disabled" | "room_full" };
