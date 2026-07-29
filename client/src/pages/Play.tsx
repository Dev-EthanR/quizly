import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
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
import { useSocket } from "../context/useSocket";
import type {
  AnswerProgressPayload,
  GameOverPayload,
  PublicQuestion,
  QuestionRevealPayload,
  QuestionStartedPayload,
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
  const { socket } = useSocket();

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
    (state?.questionIndex ?? 0) === 0,
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [hostDisconnected, setHostDisconnected] = useState(false);

  useEffect(() => {
    function handleQuestionStarted(payload: QuestionStartedPayload) {
      setQuestion(payload.question);
      setQuestionIndex(payload.questionIndex);
      setTotalQuestions(payload.totalQuestions);
      setStartedAt(payload.startedAt);
      setSelectedAnswerId(null);
      setAnswerProgress(null);
      setReveal(null);
      setPhase("question");
    }

    function handleAnswerProgress(payload: AnswerProgressPayload) {
      setAnswerProgress(payload);
    }

    function handleQuestionReveal(payload: QuestionRevealPayload) {
      setReveal(payload);
      const ownResult = payload.results.find(
        (result) => result.playerId === socket.id,
      );
      if (ownResult?.correct) {
        setCorrectCount((prev) => prev + 1);
      }
      setPhase("result");
    }

    function handleLeaderboardShown() {
      setPhase("leaderboard");
    }

    function handleGameOver(payload: GameOverPayload) {
      setGameOver(payload);
      setPhase("ended");
    }

    function handleHostDisconnected() {
      if (!state?.isHost && phase !== "ended") {
        setHostDisconnected(true);
      }
    }

    socket.on("question_started", handleQuestionStarted);
    socket.on("answer_progress", handleAnswerProgress);
    socket.on("question_reveal", handleQuestionReveal);
    socket.on("leaderboard_shown", handleLeaderboardShown);
    socket.on("game_over", handleGameOver);
    socket.on("host_disconnected", handleHostDisconnected);

    return () => {
      socket.off("question_started", handleQuestionStarted);
      socket.off("answer_progress", handleAnswerProgress);
      socket.off("question_reveal", handleQuestionReveal);
      socket.off("leaderboard_shown", handleLeaderboardShown);
      socket.off("game_over", handleGameOver);
      socket.off("host_disconnected", handleHostDisconnected);
    };
  }, [socket, state?.isHost, phase]);

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

  if (hostDisconnected) {
    return <HostDisconnected />;
  }

  const submitAnswer = (answerId: string) => {
    if (
      state?.isHost ||
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

    if (state?.isHost) {
      return <PodiumScreen leaderboard={gameOver.leaderboard} />;
    }

    const ownRank = gameOver.leaderboard.findIndex(
      (entry) => entry.playerId === socket.id,
    );
    const ownScore =
      ownRank === -1 ? 0 : gameOver.leaderboard[ownRank]!.score;

    return (
      <PlayerResultScreen
        score={ownScore}
        correctCount={correctCount}
        totalQuestions={totalQuestions}
        rank={ownRank === -1 ? gameOver.leaderboard.length : ownRank + 1}
        totalPlayers={gameOver.leaderboard.length}
      />
    );
  }

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-muted">Waiting for the next question...</p>
      </div>
    );
  }

  if (showStartCountdown) {
    return <GameCountdown onComplete={() => setShowStartCountdown(false)} />;
  }

  const ownResult = reveal?.results.find((result) => result.playerId === socket.id);
  const correctAnswersCount = reveal?.results.filter((result) => result.correct).length ?? 0;
  const categoryLabel = question.category
    ? quizCategoryLabels[question.category]
    : "Quiz";

  return (
    <div className="min-h-screen px-4 py-10">
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
                state?.isHost
                  ? "text-muted"
                  : ownResult?.correct
                    ? "text-secondary"
                    : "text-danger",
              )}
            >
              {state?.isHost
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
                  disabled={!!state?.isHost || !!selectedAnswerId}
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

              {state?.isHost ? (
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
              <Leaderboard entries={leaderboardEntries} currentPlayerId={socket.id} />
              {state?.isHost && (
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
