import type {
  AnswerProgressPayload,
  GameOverPayload,
  GamePhase,
  LobbyPlayer,
  LobbyPlayersPayload,
  PublicQuestion,
  QuestionRevealPayload,
  QuestionStartedPayload,
  RoomStatePayload,
} from "../entities/socket";

export interface PlayRoomState {
  phase: GamePhase;
  question: PublicQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  startedAt: number;
  reveal: QuestionRevealPayload | null;
  gameOver: GameOverPayload | null;
  roomNotFound: boolean;
  players: LobbyPlayer[];
  selectedAnswerId: string | null;
  answerProgress: AnswerProgressPayload | null;
}

export type PlayRoomAction =
  | { type: "QUESTION_STARTED"; payload: QuestionStartedPayload }
  | { type: "ANSWER_PROGRESS"; payload: AnswerProgressPayload }
  | { type: "QUESTION_REVEAL"; payload: QuestionRevealPayload }
  | { type: "LEADERBOARD_SHOWN" }
  | { type: "GAME_OVER"; payload: GameOverPayload }
  | { type: "ROOM_NOT_FOUND" }
  | { type: "ROOM_STATE"; payload: RoomStatePayload; sessionToken: string | undefined }
  | { type: "LOBBY_PLAYERS"; payload: LobbyPlayersPayload }
  | { type: "SELECT_ANSWER"; answerId: string };

function applyRoomState(
  state: PlayRoomState,
  payload: RoomStatePayload,
  sessionToken: string | undefined,
): PlayRoomState {
  if (payload.phase === "lobby") {
    return state;
  }

  if (payload.phase === "ended") {
    return {
      ...state,
      gameOver: {
        leaderboard: payload.leaderboard,
        totalQuestions: payload.totalQuestions,
        totalPlayers: payload.totalPlayers,
        averageAccuracy: payload.averageAccuracy,
        averageResponseMs: payload.averageResponseMs,
        completionRate: payload.completionRate,
        questionBreakdown: payload.questionBreakdown,
        fastestPlayer: payload.fastestPlayer,
        hardestQuestion: payload.hardestQuestion,
      },
      totalQuestions: payload.totalQuestions,
      phase: "ended",
    };
  }

  const base: PlayRoomState = {
    ...state,
    question: payload.question,
    questionIndex: payload.questionIndex,
    totalQuestions: payload.totalQuestions,
    startedAt: payload.startedAt,
  };

  if (payload.phase === "question") {
    return {
      ...base,
      selectedAnswerId: null,
      answerProgress: null,
      reveal: null,
      phase: "question",
    };
  }

  const ownResult = payload.reveal.results.find(
    (result) => result.playerId === sessionToken,
  );

  return {
    ...base,
    reveal: payload.reveal,
    selectedAnswerId: ownResult?.answerId ?? null,
    phase: payload.phase,
  };
}

export function playRoomReducer(
  state: PlayRoomState,
  action: PlayRoomAction,
): PlayRoomState {
  switch (action.type) {
    case "QUESTION_STARTED":
      return {
        ...state,
        question: action.payload.question,
        questionIndex: action.payload.questionIndex,
        totalQuestions: action.payload.totalQuestions,
        startedAt: action.payload.startedAt,
        selectedAnswerId: null,
        answerProgress: null,
        reveal: null,
        phase: "question",
      };
    case "ANSWER_PROGRESS":
      return { ...state, answerProgress: action.payload };
    case "QUESTION_REVEAL":
      return { ...state, reveal: action.payload, phase: "result" };
    case "LEADERBOARD_SHOWN":
      return { ...state, phase: "leaderboard" };
    case "GAME_OVER":
      return {
        ...state,
        gameOver: action.payload,
        totalQuestions: action.payload.totalQuestions,
        phase: "ended",
      };
    case "ROOM_NOT_FOUND":
      return { ...state, roomNotFound: true };
    case "ROOM_STATE":
      return applyRoomState(state, action.payload, action.sessionToken);
    case "LOBBY_PLAYERS":
      return { ...state, players: action.payload.players };
    case "SELECT_ANSWER":
      return { ...state, selectedAnswerId: action.answerId };
    default:
      return state;
  }
}
