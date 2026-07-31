import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import clsx from "clsx";
import { quizCategoryLabels } from "shared";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import GameCountdown from "../components/play/GameCountdown";
import PlayToolbar from "../components/play/PlayToolbar";
import QuestionPromptHeader from "../components/play/QuestionPromptHeader";
import QuestionPhaseView from "../components/play/QuestionPhaseView";
import ResultPhaseView from "../components/play/ResultPhaseView";
import LeaderboardPhaseView from "../components/play/LeaderboardPhaseView";
import PlayEndedView from "../components/play/PlayEndedView";
import ChatPanel from "../components/lobby/ChatPanel";
import PlayerRoster from "../components/lobby/PlayerRoster";
import HostDisconnected from "../components/lobby/HostDisconnected";
import HostReconnectingBanner from "../components/lobby/HostReconnectingBanner";
import RoomNotFound from "../components/lobby/RoomNotFound";
import { useSocket } from "../context/useSocket";
import { usePlayRoomEvents } from "../hooks/usePlayRoomEvents";
import { useCountdown } from "../hooks/useCountdown";
import { loadSession } from "../lib/session";
import { computeLeaderboardEntries } from "../lib/leaderboard";
import type { RoomSession } from "../entities/session";
import type { PublicQuestion } from "../entities/socket";

const AUTO_ADVANCE_SECONDS = 10;

interface PlayLocation {
  state?: {
    isHost?: boolean;
    questionIndex?: number;
    totalQuestions?: number;
    question?: PublicQuestion;
    startedAt?: number;
  };
}

function Play() {
  const { roomCode } = useParams();
  const { state: locationState } = useLocation() as PlayLocation;
  const { socket, status } = useSocket();

  const [session] = useState<RoomSession | null>(() =>
    roomCode ? loadSession(roomCode) : null,
  );
  const [initialStartedAt] = useState(() => locationState?.startedAt ?? Date.now());
  const [showStartCountdown, setShowStartCountdown] = useState(
    !!locationState?.question && (locationState?.questionIndex ?? 0) === 0,
  );
  const [showManagePlayers, setShowManagePlayers] = useState(false);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [showHostSummary, setShowHostSummary] = useState(false);
  const attemptRef = useRef<"rejoin" | null>(null);

  const isHost = locationState?.isHost ?? session?.isHost ?? false;

  const dismissStartCountdown = useCallback(() => {
    setShowStartCountdown(false);
  }, []);

  const { state, dispatch } = usePlayRoomEvents({
    roomCode,
    isHost,
    sessionToken: session?.token,
    initialQuestion: locationState?.question ?? null,
    initialQuestionIndex: locationState?.questionIndex ?? 0,
    initialTotalQuestions: locationState?.totalQuestions ?? 0,
    initialStartedAt,
    onRoomProgress: dismissStartCountdown,
  });

  const {
    phase,
    question,
    questionIndex,
    totalQuestions,
    startedAt,
    reveal,
    gameOver,
    hostDisconnected,
    hostReconnecting,
    roomNotFound,
    players,
    chatDisabled,
    selectedAnswerId,
    answerProgress,
  } = state;

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

  const questionDeadline =
    question && phase === "question" && !showStartCountdown
      ? startedAt + question.timeLimitSeconds * 1000
      : null;
  const remainingSeconds = useCountdown(
    questionDeadline,
    question?.timeLimitSeconds ?? 0,
  );

  const [autoAdvanceDeadline, setAutoAdvanceDeadline] = useState<number | null>(null);

  useEffect(() => {
    function activate() {
      if (!isHost || !roomCode || (phase !== "result" && phase !== "leaderboard")) {
        setAutoAdvanceDeadline(null);
        return null;
      }
      const deadline = Date.now() + AUTO_ADVANCE_SECONDS * 1000;
      setAutoAdvanceDeadline(deadline);
      return deadline;
    }

    const deadline = activate();
    if (deadline === null || !roomCode) {
      return;
    }

    const timeout = setTimeout(() => {
      if (phase === "result") {
        socket.emit("show_leaderboard", { roomCode });
      } else {
        socket.emit("next_question", { roomCode });
      }
    }, AUTO_ADVANCE_SECONDS * 1000);

    return () => clearTimeout(timeout);
  }, [isHost, roomCode, phase, socket]);

  const autoAdvanceRemaining = useCountdown(autoAdvanceDeadline, AUTO_ADVANCE_SECONDS);

  const leaderboardEntries = useMemo(
    () => computeLeaderboardEntries(reveal, questionIndex),
    [reveal, questionIndex],
  );

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
    dispatch({ type: "SELECT_ANSWER", answerId });
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
    return (
      <PlayEndedView
        gameOver={gameOver}
        isHost={isHost}
        session={session}
        showHostSummary={showHostSummary}
        setShowHostSummary={setShowHostSummary}
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
    <div className="page-shell px-4 py-10">
      <HostReconnectingBanner show={hostReconnecting && !isHost} />

      <div
        className={clsx(
          "mx-auto grid w-full max-w-5xl gap-6",
          !chatDisabled && "lg:grid-cols-[1fr_320px]",
        )}
      >
        <div className="flex min-h-0 flex-col gap-6">
          <PlayToolbar
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            isHost={isHost}
            phase={phase}
            remainingSeconds={remainingSeconds}
            timeLimitSeconds={question.timeLimitSeconds}
            onManagePlayers={() => setShowManagePlayers(true)}
            onEndQuestion={endQuestion}
            onEndGame={() => setShowEndGameConfirm(true)}
          />

          {(phase === "question" || phase === "result") && (
            <QuestionPromptHeader
              categoryLabel={categoryLabel}
              points={question.points}
              prompt={question.prompt}
            />
          )}

          {phase === "question" && (
            <QuestionPhaseView
              answerProgress={answerProgress}
              answers={question.answers}
              isHost={isHost}
              selectedAnswerId={selectedAnswerId}
              onSubmitAnswer={submitAnswer}
            />
          )}

          {phase === "result" && reveal && (
            <ResultPhaseView
              isHost={isHost}
              reveal={reveal}
              ownResult={ownResult}
              correctAnswersCount={correctAnswersCount}
              answers={question.answers}
              selectedAnswerId={selectedAnswerId}
              autoAdvanceRemaining={autoAdvanceRemaining}
              autoAdvanceTotalSeconds={AUTO_ADVANCE_SECONDS}
              onShowLeaderboard={showLeaderboard}
            />
          )}

          {phase === "leaderboard" && reveal && (
            <LeaderboardPhaseView
              entries={leaderboardEntries}
              currentPlayerId={session?.token}
              isHost={isHost}
              isFinalQuestion={questionIndex + 1 >= totalQuestions}
              autoAdvanceRemaining={autoAdvanceRemaining}
              autoAdvanceTotalSeconds={AUTO_ADVANCE_SECONDS}
              onNextQuestion={nextQuestion}
            />
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
