import { createContext } from "react";
import type { Socket } from "socket.io-client";
import type {
  HostGameInput,
  JoinRoomInput,
  KickPlayerInput,
  QuizCategory,
  RejoinRoomInput,
  SendChatMessageInput,
  StartGameInput,
  SubmitAnswerInput,
} from "shared";

export interface RoomCreatedPayload {
  roomCode: string;
}

export interface RoomNotFoundPayload {
  roomCode: string;
}

export interface HostDisconnectedPayload {
  roomCode: string;
}

export interface HostReconnectingPayload {
  roomCode: string;
}

export interface HostReconnectedPayload {
  roomCode: string;
}

export interface PlayerKickedPayload {
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
  correctCount: number;
  connected: boolean;
}

export interface QuestionRevealPayload {
  questionIndex: number;
  correctAnswerIds: string[];
  results: QuestionResult[];
  leaderboard: LeaderboardEntry[];
}

export interface GameOverPayload {
  leaderboard: LeaderboardEntry[];
  totalQuestions: number;
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
  | { phase: "ended"; leaderboard: LeaderboardEntry[]; totalQuestions: number };

export interface LobbyPlayer {
  id: string;
  name: string;
  color?: string;
  connected: boolean;
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
  room_not_found: (payload: RoomNotFoundPayload) => void;
  host_disconnected: (payload: HostDisconnectedPayload) => void;
  host_reconnecting: (payload: HostReconnectingPayload) => void;
  host_reconnected: (payload: HostReconnectedPayload) => void;
  room_state: (payload: RoomStatePayload) => void;
  lobby_players: (payload: LobbyPlayersPayload) => void;
  receive_message: (payload: ChatMessage) => void;
  game_started: (payload: GameStartedPayload) => void;
  question_started: (payload: QuestionStartedPayload) => void;
  answer_progress: (payload: AnswerProgressPayload) => void;
  question_reveal: (payload: QuestionRevealPayload) => void;
  leaderboard_shown: () => void;
  game_over: (payload: GameOverPayload) => void;
  player_kicked: (payload: PlayerKickedPayload) => void;
}

export interface ClientToServerEvents {
  host_game: (payload: HostGameInput) => void;
  join_room: (payload: JoinRoomInput) => void;
  rejoin_room: (payload: RejoinRoomInput) => void;
  send_message: (payload: SendChatMessageInput) => void;
  start_game: (payload: StartGameInput) => void;
  submit_answer: (payload: SubmitAnswerInput) => void;
  show_leaderboard: (payload: StartGameInput) => void;
  next_question: (payload: StartGameInput) => void;
  kick_player: (payload: KickPlayerInput) => void;
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
