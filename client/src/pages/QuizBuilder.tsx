import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import QuizBuilderForm from "../components/quizzes/QuizBuilderForm";
import { QuizBuilderProvider } from "../context/QuizBuilderContext";
import { hydrateBuilderState } from "../lib/quizBuilderReducer";
import { fetchQuizById } from "../lib/quizzes";

interface QuizBuilderRouteParams {
  quizId?: string;
  [key: string]: string | undefined;
}

interface QuizBuilderEditLoaderProps {
  quizId: string;
}

function QuizBuilderEditLoader({ quizId }: QuizBuilderEditLoaderProps) {
  const {
    data: quiz,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => fetchQuizById(quizId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <p className="text-muted">Loading quiz...</p>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
        <p className="text-danger">Couldn't load this quiz.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
          <Link to="/my-quizzes">
            <Button variant="secondary">Back to My Quizzes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <QuizBuilderProvider initialState={hydrateBuilderState(quiz)}>
      <QuizBuilderForm quizId={quizId} quiz={quiz} />
    </QuizBuilderProvider>
  );
}

function QuizBuilder() {
  const { quizId } = useParams<QuizBuilderRouteParams>();

  return (
    <div className="min-h-screen">
      <Navbar />
      {quizId ? (
        <QuizBuilderEditLoader quizId={quizId} />
      ) : (
        <QuizBuilderProvider>
          <QuizBuilderForm />
        </QuizBuilderProvider>
      )}
    </div>
  );
}

export default QuizBuilder;
