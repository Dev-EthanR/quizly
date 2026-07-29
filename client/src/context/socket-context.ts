import { createContext } from "react";
import type { Socket } from "socket.io-client";
import type {
  HostGameInput,
  JoinRoomInput,
  QuizCategory,
  SendChatMessageInput,
  StartGameInput,
  SubmitAnswerInput,
} from "shared";

export interface RoomCreatedPayload {
  roomCode: string;
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
}

export interface QuestionRevealPayload {
  questionIndex: number;
  correctAnswerIds: string[];
  results: QuestionResult[];
  leaderboard: LeaderboardEntry[];
}

export interface GameOverPayload {
  leaderboard: LeaderboardEntry[];
}

export interface LobbyPlayer {
  id: string;
  name: string;
  color?: string;
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

// Filled in as the server defines real events — never emit/listen for
// something that isn't a key here (keeps client + server event names in sync).
export interface ServerToClientEvents {
  room_created: (payload: RoomCreatedPayload) => void;
  lobby_players: (payload: LobbyPlayersPayload) => void;
  receive_message: (payload: ChatMessage) => void;
  game_started: (payload: GameStartedPayload) => void;
  question_started: (payload: QuestionStartedPayload) => void;
  answer_progress: (payload: AnswerProgressPayload) => void;
  question_reveal: (payload: QuestionRevealPayload) => void;
  game_over: (payload: GameOverPayload) => void;
}

export interface ClientToServerEvents {
  host_game: (payload: HostGameInput) => void;
  join_room: (payload: JoinRoomInput) => void;
  send_message: (payload: SendChatMessageInput) => void;
  start_game: (payload: StartGameInput) => void;
  submit_answer: (payload: SubmitAnswerInput) => void;
  next_question: (payload: StartGameInput) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketStatus = "connecting" | "connected" | "disconnected";

export interface SocketContextValue {
  socket: AppSocket;
  status: SocketStatus;
}

export const SocketContext = createContext<SocketContextValue | undefined>(
  undefined,
);
