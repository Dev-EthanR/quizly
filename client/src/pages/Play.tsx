import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { quizCategoryLabels } from "shared";
import Button from "../components/ui/Button";
import AnswerButton from "../components/play/AnswerButton";
import Leaderboard from "../components/play/Leaderboard";
import GameCountdown from "../components/play/GameCountdown";
import QuestionTimer from "../components/play/QuestionTimer";
import FeedbackScreen from "../components/play/FeedbackScreen";
import HostAnswerBreakdown from "../components/play/HostAnswerBreakdown";
import LobbyChat from "../components/lobby/LobbyChat";
import { useSocket } from "../context/useSocket";
import type {
  AnswerProgressPayload,
  GameOverPayload,
  PublicQuestion,
  QuestionRevealPayload,
  QuestionStartedPayload,
} from "../context/socket-context";

const ANSWER_OPTION_LABELS = ["A", "B", "C", "D"];
const LEADERBOARD_DELAY_MS = 4000;

interface PlayLocation {
  state?: {
    isHost?: boolean;
    questionIndex?: number;
    totalQuestions?: number;
    question?: PublicQuestion;
    startedAt?: number;
  };
}

type GamePhase = "question" | "feedback" | "host-reveal" | "leaderboard" | "ended";

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
      setPhase(state?.isHost ? "host-reveal" : "feedback");
    }

    function handleGameOver(payload: GameOverPayload) {
      setGameOver(payload);
      setPhase("ended");
    }

    socket.on("question_started", handleQuestionStarted);
    socket.on("answer_progress", handleAnswerProgress);
    socket.on("question_reveal", handleQuestionReveal);
    socket.on("game_over", handleGameOver);

    return () => {
      socket.off("question_started", handleQuestionStarted);
      socket.off("answer_progress", handleAnswerProgress);
      socket.off("question_reveal", handleQuestionReveal);
      socket.off("game_over", handleGameOver);
    };
  }, [socket, state?.isHost]);

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

  useEffect(() => {
    if (phase !== "feedback" && phase !== "host-reveal") {
      return;
    }

    const timeout = setTimeout(() => setPhase("leaderboard"), LEADERBOARD_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [phase]);

  if (!roomCode) {
    return null;
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

  const nextQuestion = () => {
    socket.emit("next_question", { roomCode });
  };

  if (phase === "ended") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-foreground">Game over!</h1>
        {gameOver && (
          <Leaderboard entries={gameOver.leaderboard} currentPlayerId={socket.id} />
        )}
      </div>
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

          {phase === "question" && (
            <>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-sm font-semibold text-primary">
                  {categoryLabel} &middot; {question.points} pts
                </span>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {question.prompt}
                </h1>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted">
                <FiUsers className="h-4 w-4" />
                <span>
                  {answerProgress
                    ? `${answerProgress.answered}/${answerProgress.total}`
                    : "0"}{" "}
                  answered
                </span>
              </div>

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
            </>
          )}

          {phase === "feedback" && reveal && (
            <FeedbackScreen
              correct={!!ownResult?.correct}
              pointsAwarded={ownResult?.pointsAwarded ?? 0}
              totalScore={ownResult?.totalScore ?? 0}
              correctAnswerText={
                question.answers.find((answer) =>
                  reveal.correctAnswerIds.includes(answer.id),
                )?.text
              }
            />
          )}

          {phase === "host-reveal" && reveal && (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
              <h2 className="text-2xl font-bold text-foreground">Results</h2>
              <HostAnswerBreakdown
                options={question.answers.map((answer) => ({
                  id: answer.id,
                  text: answer.text,
                  isCorrect: reveal.correctAnswerIds.includes(answer.id),
                  count: reveal.results.filter(
                    (result) => result.answerId === answer.id,
                  ).length,
                }))}
                totalResponses={reveal.results.length}
              />
            </div>
          )}

          {phase === "leaderboard" && reveal && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6">
              <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
              <Leaderboard entries={reveal.leaderboard} currentPlayerId={socket.id} />
              {state?.isHost && (
                <Button type="button" onClick={nextQuestion}>
                  {questionIndex + 1 >= totalQuestions ? "Finish game" : "Next question"}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="h-[420px] min-h-0 lg:h-auto">
          <LobbyChat roomCode={roomCode} />
        </div>
      </div>
    </div>
  );
}

export default Play;
