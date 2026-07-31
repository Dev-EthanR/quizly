import { useQuery } from "@tanstack/react-query";
import ErrorRetry from "../ui/ErrorRetry";
import DiscoveryQuizCard from "./DiscoveryQuizCard";
import DiscoveryQuizCardSkeleton from "./DiscoveryQuizCardSkeleton";
import { fetchSavedQuizzes } from "../../lib/quizzes";

const SAVED_SKELETON_COUNT = 3;

function SavedQuizzesTab() {
  const {
    data: quizzes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["saved-quizzes"],
    queryFn: fetchSavedQuizzes,
  });

  return (
    <div className="mt-8">
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: SAVED_SKELETON_COUNT }).map((_, index) => (
            <DiscoveryQuizCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorRetry
          message="Couldn't load your saved quizzes."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && quizzes && quizzes.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-muted">
            You haven't saved any quizzes yet.
          </p>
        </div>
      )}

      {!isLoading && !isError && quizzes && quizzes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <DiscoveryQuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedQuizzesTab;
