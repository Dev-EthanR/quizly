import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import clsx from "clsx";
import { quizCategoryLabels } from "shared";
import Button from "../components/ui/Button";
import AnswerButton from "../components/play/AnswerButton";
import AnswerResultButton from "../components/play/AnswerResultButton";
import Leaderboard, {
  type LeaderboardRankChange,
  type LeaderboardRowEntry,
} from "../components/play/Leaderboard";
import GameCountdown from "../components/play/GameCountdown";
import QuestionTimer from "../components/play/QuestionTimer";
import PodiumScreen from "../components/play/PodiumScreen";
import PlayerResultScreen from "../components/play/PlayerResultScreen";
import LobbyChat from "../components/lobby/LobbyChat";
import HostDisconnected from "../components/lobby/HostDisconnected";
import RoomNotFound from "../components/lobby/RoomNotFound";
import { useSocket } from "../context/useSocket";
import { clearSession, loadSession, type RoomSession } from "../lib/session";
import type {
  AnswerProgressPayload,
  GameOverPayload,
  PublicQuestion,
  QuestionRevealPayload,
  QuestionStartedPayload,
  RoomStatePayload,
} from "../context/socket-context";

const ANSWER_OPTION_LABELS = ["A", "B", "C", "D"];

interface PlayLocation {
  state?: {
    isHost?: boolean;
    questionIndex?: number;
    totalQuestions?: number;
    question?: PublicQuestion;
    startedAt?: number;
  };
}

type GamePhase = "question" | "result" | "leaderboard" | "ended";

function Play() {
  const { roomCode } = useParams();
  const { state } = useLocation() as PlayLocation;
  const navigate = useNavigate();
  const { socket, status } = useSocket();

  const [session] = useState<RoomSession | null>(() =>
    roomCode ? loadSession(roomCode) : null,
  );
  const [phase, setPhase] = useState<GamePhase>("question");
  const [question, setQuestion] = useState<PublicQuestion | null>(
    state?.question ?? null,
  );
  const [questionIndex, setQuestionIndex] = useState(state?.questionIndex ?? 0);
  const [totalQuestions, setTotalQuestions] = useState(
    state?.totalQuestions ?? 0,
  );
  const [startedAt, setStartedAt] = useState(() => state?.startedAt ?? Date.now());
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [answerProgress, setAnswerProgress] =
    useState<AnswerProgressPayload | null>(null);
  const [reveal, setReveal] = useState<QuestionRevealPayload | null>(null);
  const [gameOver, setGameOver] = useState<GameOverPayload | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(
    question?.timeLimitSeconds ?? 0,
  );
  const [showStartCountdown, setShowStartCountdown] = useState(
    !!state?.question && (state?.questionIndex ?? 0) === 0,
  );
  const [hostDisconnected, setHostDisconnected] = useState(false);
  const [hostReconnecting, setHostReconnecting] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const attemptRef = useRef<"rejoin" | null>(null);

  const isHost = state?.isHost ?? session?.isHost ?? false;

  useEffect(() => {
    function handleQuestionStarted(payload: QuestionStartedPayload) {
      setQuestion(payload.question);
      setQuestionIndex(payload.questionIndex);
      setTotalQuestions(payload.totalQuestions);
      setStartedAt(payload.startedAt);
      setSelectedAnswerId(null);
      setAnswerProgress(null);
      setReveal(null);
      setShowStartCountdown(false);
      setPhase("question");
    }

    function handleAnswerProgress(payload: AnswerProgressPayload) {
      setAnswerProgress(payload);
    }

    function handleQuestionReveal(payload: QuestionRevealPayload) {
      setReveal(payload);
      setPhase("result");
    }

    function handleLeaderboardShown() {
      setPhase("leaderboard");
    }

    function handleGameOver(payload: GameOverPayload) {
      setGameOver(payload);
      setTotalQuestions(payload.totalQuestions);
      setPhase("ended");
    }

    function handleHostReconnecting() {
      setHostReconnecting(true);
    }

    function handleHostReconnected() {
      setHostReconnecting(false);
    }

    function handleHostDisconnected() {
      if (!isHost) {
        setHostDisconnected(true);
      }
    }

    function handleRoomNotFound() {
      if (roomCode) {
        clearSession(roomCode);
      }
      setRoomNotFound(true);
    }

    function handleRoomState(payload: RoomStatePayload) {
      if (payload.phase === "lobby") {
        if (roomCode) {
          navigate(`/lobby/${roomCode}`, { replace: true });
        }
        return;
      }

      if (payload.phase === "ended") {
        setGameOver({ leaderboard: payload.leaderboard, totalQuestions: payload.totalQuestions });
        setTotalQuestions(payload.totalQuestions);
        setPhase("ended");
        return;
      }

      setQuestion(payload.question);
      setQuestionIndex(payload.questionIndex);
      setTotalQuestions(payload.totalQuestions);
      setStartedAt(payload.startedAt);
      setShowStartCountdown(false);

      if (payload.phase === "question") {
        setSelectedAnswerId(null);
        setAnswerProgress(null);
        setReveal(null);
        setPhase("question");
        return;
      }

      setReveal(payload.reveal);
      const ownResult = payload.reveal.results.find(
        (result) => result.playerId === session?.token,
      );
      setSelectedAnswerId(ownResult?.answerId ?? null);
      setPhase(payload.phase);
    }

    socket.on("question_started", handleQuestionStarted);
    socket.on("answer_progress", handleAnswerProgress);
    socket.on("question_reveal", handleQuestionReveal);
    socket.on("leaderboard_shown", handleLeaderboardShown);
    socket.on("game_over", handleGameOver);
    socket.on("host_reconnecting", handleHostReconnecting);
    socket.on("host_reconnected", handleHostReconnected);
    socket.on("host_disconnected", handleHostDisconnected);
    socket.on("room_not_found", handleRoomNotFound);
    socket.on("room_state", handleRoomState);

    return () => {
      socket.off("question_started", handleQuestionStarted);
      socket.off("answer_progress", handleAnswerProgress);
      socket.off("question_reveal", handleQuestionReveal);
      socket.off("leaderboard_shown", handleLeaderboardShown);
      socket.off("game_over", handleGameOver);
      socket.off("host_reconnecting", handleHostReconnecting);
      socket.off("host_reconnected", handleHostReconnected);
      socket.off("host_disconnected", handleHostDisconnected);
      socket.off("room_not_found", handleRoomNotFound);
      socket.off("room_state", handleRoomState);
    };
  }, [socket, isHost, roomCode, navigate, session?.token]);

  useEffect(() => {
    if (status === "disconnected") {
      attemptRef.current = null;
    }
  }, [status]);

  useEffect(() => {
    if (!roomCode || !session || status !== "connected" || attemptRef.current) {
      return;
    }

    attemptRef.current = "rejoin";
    socket.emit("rejoin_room", { roomCode, token: session.token });
  }, [roomCode, session, status, socket]);

  useEffect(() => {
    if (!question || phase !== "question" || showStartCountdown) {
      return;
    }

    const update = () => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      setRemainingSeconds(
        Math.max(0, Math.ceil(question.timeLimitSeconds - elapsedSeconds)),
      );
    };

    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [question, startedAt, phase, showStartCountdown]);

  const leaderboardEntries = useMemo<LeaderboardRowEntry[]>(() => {
    if (!reveal) {
      return [];
    }

    const previousScoreByPlayer = new Map<string, number>();
    reveal.results.forEach((result) => {
      previousScoreByPlayer.set(result.playerId, result.totalScore - result.pointsAwarded);
    });

    const previousRankByPlayer = new Map<string, number>();
    if (questionIndex > 0) {
      [...reveal.leaderboard]
        .sort(
          (a, b) =>
            (previousScoreByPlayer.get(b.playerId) ?? 0) -
            (previousScoreByPlayer.get(a.playerId) ?? 0),
        )
        .forEach((entry, index) => previousRankByPlayer.set(entry.playerId, index));
    }

    return reveal.leaderboard.map((entry, index) => {
      const pointsGained = reveal.results.find(
        (result) => result.playerId === entry.playerId,
      )?.pointsAwarded ?? 0;

      let rankChange: LeaderboardRankChange = "same";
      const previousRank = previousRankByPlayer.get(entry.playerId);
      if (previousRank !== undefined) {
        if (index < previousRank) rankChange = "up";
        else if (index > previousRank) rankChange = "down";
      }

      return { ...entry, pointsGained, rankChange };
    });
  }, [reveal, questionIndex]);

  if (!roomCode) {
    return null;
  }

  if (roomNotFound || !session) {
    return <RoomNotFound roomCode={roomCode} />;
  }

  if (hostDisconnected) {
    return <HostDisconnected />;
  }

  const submitAnswer = (answerId: string) => {
    if (
      isHost ||
      selectedAnswerId ||
      phase !== "question" ||
      showStartCountdown
    ) {
      return;
    }
    setSelectedAnswerId(answerId);
    socket.emit("submit_answer", { roomCode, questionIndex, answerId });
  };

  const showLeaderboard = () => {
    socket.emit("show_leaderboard", { roomCode });
  };

  const nextQuestion = () => {
    socket.emit("next_question", { roomCode });
  };

  if (phase === "ended") {
    if (!gameOver) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4 text-center">
          <p className="text-muted">Tallying final results...</p>
        </div>
      );
    }

    if (isHost) {
      return <PodiumScreen leaderboard={gameOver.leaderboard} />;
    }

    const ownRank = gameOver.leaderboard.findIndex(
      (entry) => entry.playerId === session?.token,
    );
    const ownEntry = ownRank === -1 ? undefined : gameOver.leaderboard[ownRank];

    return (
      <PlayerResultScreen
        score={ownEntry?.score ?? 0}
        correctCount={ownEntry?.correctCount ?? 0}
        totalQuestions={totalQuestions}
        rank={ownRank === -1 ? gameOver.leaderboard.length : ownRank + 1}
        totalPlayers={gameOver.leaderboard.length}
      />
    );
  }

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-muted">Reconnecting to the game...</p>
      </div>
    );
  }

  if (showStartCountdown) {
    return <GameCountdown onComplete={() => setShowStartCountdown(false)} />;
  }

  const ownResult = reveal?.results.find((result) => result.playerId === session?.token);
  const correctAnswersCount = reveal?.results.filter((result) => result.correct).length ?? 0;
  const categoryLabel = question.category
    ? quizCategoryLabels[question.category]
    : "Quiz";

  return (
    <div className="min-h-screen px-4 py-10">
      {hostReconnecting && !isHost && (
        <p className="mx-auto mb-6 w-fit rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm font-medium text-warning">
          Host disconnected — waiting for them to reconnect...
        </p>
      )}

      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-h-0 flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            {phase === "question" && (
              <div className="w-40">
                <QuestionTimer
                  remainingSeconds={remainingSeconds}
                  totalSeconds={question.timeLimitSeconds}
                />
              </div>
            )}
          </div>

          {(phase === "question" || phase === "result") && (
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-sm font-semibold text-primary">
                {categoryLabel} &middot; {question.points} pts
              </span>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {question.prompt}
              </h1>
            </div>
          )}

          {phase === "question" && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted">
              <FiUsers className="h-4 w-4" />
              <span>
                {answerProgress
                  ? `${answerProgress.answered}/${answerProgress.total}`
                  : "0"}{" "}
                answered
              </span>
            </div>
          )}

          {phase === "result" && reveal && (
            <p
              className={clsx(
                "text-center text-lg font-bold",
                isHost
                  ? "text-muted"
                  : ownResult?.correct
                    ? "text-secondary"
                    : "text-danger",
              )}
            >
              {isHost
                ? `${correctAnswersCount} of ${reveal.results.length} answered correctly`
                : ownResult?.correct
                  ? `Correct! +${ownResult.pointsAwarded} points`
                  : "Incorrect — +0 points"}
            </p>
          )}

          {phase === "question" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {question.answers.map((answer, index) => (
                <AnswerButton
                  key={answer.id}
                  text={answer.text}
                  optionLabel={
                    ANSWER_OPTION_LABELS[index % ANSWER_OPTION_LABELS.length]!
                  }
                  disabled={isHost || !!selectedAnswerId}
                  isSelected={selectedAnswerId === answer.id}
                  onClick={() => submitAnswer(answer.id)}
                />
              ))}
            </div>
          )}

          {phase === "result" && reveal && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {question.answers.map((answer) => (
                  <AnswerResultButton
                    key={answer.id}
                    text={answer.text}
                    isCorrect={reveal.correctAnswerIds.includes(answer.id)}
                    isOwnAnswer={selectedAnswerId === answer.id}
                    count={
                      reveal.results.filter(
                        (result) => result.answerId === answer.id,
                      ).length
                    }
                    totalResponses={reveal.results.length}
                  />
                ))}
              </div>

              {isHost ? (
                <div className="flex justify-center">
                  <Button type="button" onClick={showLeaderboard}>
                    Show Leaderboard
                  </Button>
                </div>
              ) : (
                <p className="text-center text-sm text-muted">
                  Waiting for host...
                </p>
              )}
            </>
          )}

          {phase === "leaderboard" && reveal && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6">
              <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
              <Leaderboard entries={leaderboardEntries} currentPlayerId={session?.token} />
              {isHost && (
                <Button type="button" onClick={nextQuestion}>
                  {questionIndex + 1 >= totalQuestions ? "Finish game" : "Next question"}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="h-[520px] lg:sticky lg:top-10">
          <LobbyChat roomCode={roomCode} />
        </div>
      </div>
    </div>
  );
}

export default Play;
