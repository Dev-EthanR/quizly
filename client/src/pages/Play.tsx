import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import Button from "../components/ui/Button";
import AnswerButton from "../components/play/AnswerButton";
import Leaderboard from "../components/play/Leaderboard";
import { useSocket } from "../context/useSocket";
import type {
  AnswerProgressPayload,
  GameOverPayload,
  PublicQuestion,
  QuestionRevealPayload,
  QuestionStartedPayload,
} from "../context/socket-context";

const ANSWER_COLOR_CLASSES = ["bg-primary", "bg-secondary", "bg-warning", "bg-danger"];

interface PlayLocation {
  state?: {
    isHost?: boolean;
    questionIndex?: number;
    totalQuestions?: number;
    question?: PublicQuestion;
    startedAt?: number;
  };
}

type GamePhase = "question" | "reveal" | "ended";

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
  const [startedAt, setStartedAt] = useState(state?.startedAt ?? Date.now());
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [answerProgress, setAnswerProgress] =
    useState<AnswerProgressPayload | null>(null);
  const [reveal, setReveal] = useState<QuestionRevealPayload | null>(null);
  const [gameOver, setGameOver] = useState<GameOverPayload | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(
    question?.timeLimitSeconds ?? 0,
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
      setPhase("reveal");
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
  }, [socket]);

  useEffect(() => {
    if (!question || phase !== "question") {
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
  }, [question, startedAt, phase]);

  if (!roomCode) {
    return null;
  }

  const submitAnswer = (answerId: string) => {
    if (state?.isHost || selectedAnswerId || phase !== "question") {
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

  const ownResult = reveal?.results.find((result) => result.playerId === socket.id);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        {phase === "question" && (
          <span className="text-lg font-bold text-primary">
            {remainingSeconds}s
          </span>
        )}
      </div>

      <h1 className="text-center text-2xl font-bold text-foreground">
        {question.prompt}
      </h1>

      {phase === "question" && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted">
          <FiUsers className="h-4 w-4" />
          <span>
            {answerProgress ? `${answerProgress.answered}/${answerProgress.total}` : "0"}{" "}
            answered
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {question.answers.map((answer, index) => (
          <AnswerButton
            key={answer.id}
            text={answer.text}
            colorClass={ANSWER_COLOR_CLASSES[index % ANSWER_COLOR_CLASSES.length]!}
            disabled={!!state?.isHost || phase !== "question" || !!selectedAnswerId}
            isSelected={selectedAnswerId === answer.id}
            isRevealed={phase === "reveal"}
            isCorrect={!!reveal?.correctAnswerIds.includes(answer.id)}
            onClick={() => submitAnswer(answer.id)}
          />
        ))}
      </div>

      {phase === "reveal" && reveal && (
        <div className="flex flex-col items-center gap-4">
          {!state?.isHost && (
            <p className="text-foreground">
              {ownResult?.correct
                ? `Correct! +${ownResult.pointsAwarded} points`
                : "No points this round"}
            </p>
          )}
          <Leaderboard entries={reveal.leaderboard} currentPlayerId={socket.id} />
          {state?.isHost && (
            <Button type="button" onClick={nextQuestion}>
              {questionIndex + 1 >= totalQuestions ? "Finish game" : "Next question"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default Play;
