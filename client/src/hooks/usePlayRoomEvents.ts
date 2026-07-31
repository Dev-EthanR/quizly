import { useEffect, useReducer, type Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/useSocket";
import { clearSession } from "../lib/session";
import {
  playRoomReducer,
  type PlayRoomAction,
  type PlayRoomState,
} from "../lib/playRoomReducer";
import type {
  AnswerProgressPayload,
  GameOverPayload,
  LobbyPlayersPayload,
  PublicQuestion,
  QuestionRevealPayload,
  QuestionStartedPayload,
  RoomStatePayload,
} from "../entities/socket";

export interface UsePlayRoomEventsParams {
  roomCode: string | undefined;
  sessionToken: string | undefined;
  initialQuestion: PublicQuestion | null;
  initialQuestionIndex: number;
  initialTotalQuestions: number;
  initialStartedAt: number;
  onRoomProgress: () => void;
}

export interface UsePlayRoomEventsResult {
  state: PlayRoomState;
  dispatch: Dispatch<PlayRoomAction>;
}

export function usePlayRoomEvents({
  roomCode,
  sessionToken,
  initialQuestion,
  initialQuestionIndex,
  initialTotalQuestions,
  initialStartedAt,
  onRoomProgress,
}: UsePlayRoomEventsParams): UsePlayRoomEventsResult {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(playRoomReducer, {
    phase: "question",
    question: initialQuestion,
    questionIndex: initialQuestionIndex,
    totalQuestions: initialTotalQuestions,
    startedAt: initialStartedAt,
    reveal: null,
    gameOver: null,
    roomNotFound: false,
    players: [],
    selectedAnswerId: null,
    answerProgress: null,
  });

  useEffect(() => {
    function handleQuestionStarted(payload: QuestionStartedPayload) {
      dispatch({ type: "QUESTION_STARTED", payload });
      onRoomProgress();
    }

    function handleAnswerProgress(payload: AnswerProgressPayload) {
      dispatch({ type: "ANSWER_PROGRESS", payload });
    }

    function handleQuestionReveal(payload: QuestionRevealPayload) {
      dispatch({ type: "QUESTION_REVEAL", payload });
    }

    function handleLeaderboardShown() {
      dispatch({ type: "LEADERBOARD_SHOWN" });
    }

    function handleGameOver(payload: GameOverPayload) {
      dispatch({ type: "GAME_OVER", payload });
    }

    function handleRoomNotFound() {
      dispatch({ type: "ROOM_NOT_FOUND" });
    }

    function handleLobbyPlayers(payload: LobbyPlayersPayload) {
      dispatch({ type: "LOBBY_PLAYERS", payload });
    }

    function handleRoomState(payload: RoomStatePayload) {
      if (payload.phase === "lobby") {
        if (roomCode) {
          navigate(`/lobby/${roomCode}`, { replace: true });
        }
        return;
      }

      dispatch({ type: "ROOM_STATE", payload, sessionToken });

      if (payload.phase !== "ended") {
        onRoomProgress();
      }
    }

    socket.on("question_started", handleQuestionStarted);
    socket.on("answer_progress", handleAnswerProgress);
    socket.on("question_reveal", handleQuestionReveal);
    socket.on("leaderboard_shown", handleLeaderboardShown);
    socket.on("game_over", handleGameOver);
    socket.on("room_not_found", handleRoomNotFound);
    socket.on("room_state", handleRoomState);
    socket.on("lobby_players", handleLobbyPlayers);

    return () => {
      socket.off("question_started", handleQuestionStarted);
      socket.off("answer_progress", handleAnswerProgress);
      socket.off("question_reveal", handleQuestionReveal);
      socket.off("leaderboard_shown", handleLeaderboardShown);
      socket.off("game_over", handleGameOver);
      socket.off("room_not_found", handleRoomNotFound);
      socket.off("room_state", handleRoomState);
      socket.off("lobby_players", handleLobbyPlayers);
    };
  }, [socket, roomCode, navigate, sessionToken, onRoomProgress]);

  useEffect(() => {
    if (state.roomNotFound && roomCode) {
      clearSession(roomCode);
    }
  }, [state.roomNotFound, roomCode]);

  return { state, dispatch };
}
