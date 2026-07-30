import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import clsx from "clsx";
import { quizCategoryLabels } from "shared";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AnswerButton from "../components/play/AnswerButton";
import AnswerResultButton from "../components/play/AnswerResultButton";
import Leaderboard, {
  type LeaderboardRankChange,
  type LeaderboardRowEntry,
} from "../components/play/Leaderboard";
import GameCountdown from "../components/play/GameCountdown";
import QuestionTimer from "../components/play/QuestionTimer";
import PodiumScreen from "../components/play/PodiumScreen";
import HostSummaryScreen from "../components/play/HostSummaryScreen";
import PlayerResultScreen from "../components/play/PlayerResultScreen";
import ChatPanel from "../components/lobby/ChatPanel";
import PlayerRoster from "../components/lobby/PlayerRoster";
import HostDisconnected from "../components/lobby/HostDisconnected";
import RoomNotFound from "../components/lobby/RoomNotFound";
import { useSocket } from "../context/useSocket";
import { clearSession, loadSession, type RoomSession } from "../lib/session";
import type {
  AnswerProgressPayload,
  GameOverPayload,
  LobbyPlayer,
  LobbyPlayersPayload,
  PublicQuestion,
  QuestionRevealPayload,
  QuestionStartedPayload,
  RoomSettingsPayload,
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
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [showManagePlayers, setShowManagePlayers] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [showHostSummary, setShowHostSummary] = useState(false);
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

    function handleLobbyPlayers(payload: LobbyPlayersPayload) {
      setPlayers(payload.players);
    }

    function handleRoomSettings(payload: RoomSettingsPayload) {
      setChatDisabled(payload.disableChat);
    }

    function handlePlayerKicked() {
      if (roomCode) {
        clearSession(roomCode);
      }
      navigate("/removed", { replace: true });
    }

    function handleRoomState(payload: RoomStatePayload) {
      if (payload.phase === "lobby") {
        if (roomCode) {
          navigate(`/lobby/${roomCode}`, { replace: true });
        }
        return;
      }

      if (payload.phase === "ended") {
        setGameOver({
          leaderboard: payload.leaderboard,
          totalQuestions: payload.totalQuestions,
          totalPlayers: payload.totalPlayers,
          averageAccuracy: payload.averageAccuracy,
          averageResponseMs: payload.averageResponseMs,
          completionRate: payload.completionRate,
          questionBreakdown: payload.questionBreakdown,
          fastestPlayer: payload.fastestPlayer,
          hardestQuestion: payload.hardestQuestion,
        });
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
    socket.on("lobby_players", handleLobbyPlayers);
    socket.on("room_settings", handleRoomSettings);
    socket.on("player_kicked", handlePlayerKicked);

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
      socket.off("lobby_players", handleLobbyPlayers);
      socket.off("room_settings", handleRoomSettings);
      socket.off("player_kicked", handlePlayerKicked);
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

  const handleKickPlayer = (playerId: string) => {
    socket.emit("kick_player", { roomCode, token: playerId });
  };

  const handleSetMuted = (playerId: string, muted: boolean) => {
    socket.emit("set_player_muted", { roomCode, token: playerId, muted });
  };

  const endQuestion = () => {
    socket.emit("end_question", { roomCode });
  };

  const endGame = () => {
    socket.emit("end_game", { roomCode });
    setShowEndGameConfirm(false);
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
      if (showHostSummary) {
        return (
          <HostSummaryScreen summary={gameOver} onBack={() => setShowHostSummary(false)} />
        );
      }
      return (
        <PodiumScreen
          leaderboard={gameOver.leaderboard}
          onViewSummary={() => setShowHostSummary(true)}
        />
      );
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
  const isMuted = players.find((p) => p.id === session?.token)?.muted ?? false;

  return (
    <div className="min-h-screen px-4 py-10">
      {hostReconnecting && !isHost && (
        <p className="mx-auto mb-6 w-fit rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm font-medium text-warning">
          Host disconnected — waiting for them to reconnect...
        </p>
      )}

      <div
        className={clsx(
          "mx-auto grid w-full max-w-5xl gap-6",
          !chatDisabled && "lg:grid-cols-[1fr_320px]",
        )}
      >
        <div className="flex min-h-0 flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            <div className="flex items-center gap-3">
              {isHost && (
                <button
                  type="button"
                  onClick={() => setShowManagePlayers(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                >
                  <FiUsers className="h-3.5 w-3.5" />
                  Manage players
                </button>
              )}
              {isHost && phase === "question" && (
                <button
                  type="button"
                  onClick={endQuestion}
                  className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                >
                  End question
                </button>
              )}
              {isHost && (
                <button
                  type="button"
                  onClick={() => setShowEndGameConfirm(true)}
                  className="cursor-pointer rounded-full border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
                >
                  End game
                </button>
              )}
              {phase === "question" && (
                <div className="w-40">
                  <QuestionTimer
                    remainingSeconds={remainingSeconds}
                    totalSeconds={question.timeLimitSeconds}
                  />
                </div>
              )}
            </div>
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

        {!chatDisabled && (
          <ChatPanel
            roomCode={roomCode}
            disabled={isMuted}
            disabledReason={isMuted ? "You have been muted by the host." : undefined}
          />
        )}
      </div>

      {showManagePlayers && (
        <Modal
          title="Manage players"
          ariaLabel="Manage players"
          onClose={() => setShowManagePlayers(false)}
        >
          <PlayerRoster
            players={players}
            currentPlayerId={session?.token}
            onKick={handleKickPlayer}
            onSetMuted={handleSetMuted}
          />
        </Modal>
      )}

      {showEndGameConfirm && (
        <ConfirmDialog
          title="End game early?"
          message="This will immediately end the game for all players and show the final leaderboard. This can't be undone."
          confirmLabel="End game"
          onConfirm={endGame}
          onCancel={() => setShowEndGameConfirm(false)}
        />
      )}
    </div>
  );
}

export default Play;
