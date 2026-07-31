import { useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { FiArrowLeft } from "react-icons/fi";
import Navbar from "../components/layout/Navbar";
import ErrorRetry from "../components/ui/ErrorRetry";
import QuizDetailsSkeleton from "../components/quizzes/QuizDetailsSkeleton";
import QuizNotFoundState from "../components/quizzes/QuizNotFoundState";
import QuizDetailsContent from "../components/quizzes/QuizDetailsContent";
import { useDiscoverQuiz } from "../hooks/useDiscoverQuiz";
import { useSaveQuizMutation } from "../hooks/useSaveQuizMutation";
import { useShareLink } from "../hooks/useShareLink";

interface QuizDetailsParams {
  quizId: string;
}

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

        {isLoading && <QuizDetailsSkeleton />}

        {!isLoading && isError && notFound && <QuizNotFoundState />}

        {!isLoading && isError && !notFound && (
          <ErrorRetry
            message="Couldn't load this quiz."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && quiz && (
          <QuizDetailsContent
            quiz={quiz}
            isSaving={saveMutation.isPending}
            onToggleSave={() => saveMutation.mutate(!quiz.isSaved)}
            copied={copied}
            onShare={() => share()}
          />
        )}
      </div>
    </div>
  );
}

export default QuizDetails;
