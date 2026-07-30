import { useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiBookmark,
  FiCheck,
  FiClock,
  FiHelpCircle,
  FiPlay,
  FiShare2,
  FiStar,
} from "react-icons/fi";
import clsx from "clsx";
import { quizCategoryLabels, quizDifficultyLabels, type QuizDifficulty } from "shared";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import ErrorRetry from "../components/ui/ErrorRetry";
import ImageFallback from "../components/ui/ImageFallback";
import IndexBadge from "../components/ui/IndexBadge";
import StatTile from "../components/ui/StatTile";
import TagPill from "../components/ui/TagPill";
import HostQuizButton from "../components/quizzes/HostQuizButton";
import { useDiscoverQuiz } from "../hooks/useDiscoverQuiz";
import { useSaveQuizMutation } from "../hooks/useSaveQuizMutation";
import { useShareLink } from "../hooks/useShareLink";

interface QuizDetailsParams {
  quizId: string;
}

const DIFFICULTY_BADGE_CLASS: Record<QuizDifficulty, string> = {
  easy: "bg-secondary/90",
  medium: "bg-warning/90",
  hard: "bg-danger/90",
};

function QuizDetails() {
  const { quizId } = useParams() as Partial<QuizDetailsParams>;
  const { data: quiz, isLoading, isError, error, refetch } = useDiscoverQuiz(quizId);
  const saveMutation = useSaveQuizMutation(quizId ?? "");
  const { copied, share } = useShareLink();

  const notFound = isAxiosError(error) && error.response?.status === 404;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link
          to="/discovery"
          className="mb-6 flex w-fit items-center gap-2 text-sm font-semibold text-muted hover:text-foreground"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Discovery
        </Link>

        {isLoading && (
          <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div className="flex flex-col gap-4">
              <div className="h-56 rounded-xl bg-chat" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 rounded-xl bg-chat" />
                <div className="h-24 rounded-xl bg-chat" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-8 w-2/3 rounded bg-chat" />
              <div className="h-4 w-1/3 rounded bg-chat" />
              <div className="h-20 rounded bg-chat" />
            </div>
          </div>
        )}

        {!isLoading && isError && notFound && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
              <FiAlertTriangle size={28} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Quiz not found
            </h1>
            <p className="text-muted">
              This quiz may have been unpublished or made private.
            </p>
            <Link to="/discovery" className="mt-2">
              <Button type="button">Back to Discovery</Button>
            </Link>
          </div>
        )}

        {!isLoading && isError && !notFound && (
          <ErrorRetry
            message="Couldn't load this quiz."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && quiz && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div className="flex flex-col gap-4">
              <ImageFallback
                src={quiz.coverImage}
                fallbackText={quiz.title}
                className="h-56"
                textClassName="text-5xl font-bold"
              />

              <div className="grid grid-cols-2 gap-4">
                <StatTile
                  layout="compact"
                  icon={<FiHelpCircle className="h-5 w-5" />}
                  value={quiz.questionCount}
                  label={quiz.questionCount === 1 ? "Question" : "Questions"}
                />
                <StatTile
                  layout="compact"
                  icon={<FiPlay className="h-5 w-5" />}
                  value={quiz.playCount}
                  label={quiz.playCount === 1 ? "Play" : "Plays"}
                />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                {quiz.category && (
                  <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                    {quizCategoryLabels[quiz.category]}
                  </span>
                )}
                {quiz.difficulty && (
                  <span
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-semibold text-white",
                      DIFFICULTY_BADGE_CLASS[quiz.difficulty],
                    )}
                  >
                    {quizDifficultyLabels[quiz.difficulty]}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-foreground">
                {quiz.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-muted">
                <ImageFallback
                  src={quiz.ownerImage}
                  fallbackText={quiz.ownerName ?? "?"}
                  shape="circle"
                  className="h-6 w-6"
                  textClassName="text-xs font-bold"
                  referrerPolicy="no-referrer"
                />
                <span>Created by {quiz.ownerName ?? "Unknown host"}</span>
              </div>

              {quiz.description && (
                <p className="text-foreground/90">{quiz.description}</p>
              )}

              {quiz.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quiz.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <HostQuizButton quizId={quiz.id} label="Host quiz" />

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => saveMutation.mutate(!quiz.isSaved)}
                  disabled={saveMutation.isPending}
                  className={clsx(
                    "flex items-center gap-2",
                    quiz.isSaved && "border-primary/40 bg-primary/15 text-primary",
                  )}
                >
                  <FiBookmark className="h-4 w-4" />
                  {quiz.isSaved ? "Saved" : "Save quiz"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => share()}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <FiCheck className="h-4 w-4" />
                  ) : (
                    <FiShare2 className="h-4 w-4" />
                  )}
                  {copied ? "Copied!" : "Share quiz"}
                </Button>
              </div>

              <hr className="border-border" />

              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Questions
                </h2>

                <ol className="flex flex-col gap-2">
                  {quiz.questions.map((question, index) => (
                    <li
                      key={question.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <IndexBadge size="md">{index + 1}</IndexBadge>
                        <span className="truncate text-foreground">
                          {question.prompt}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <FiClock className="h-3.5 w-3.5" />
                          {question.timeLimitSeconds}s
                        </span>
                        <span className="flex items-center gap-1">
                          <FiStar className="h-3.5 w-3.5" />
                          {question.points} pts
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizDetails;
