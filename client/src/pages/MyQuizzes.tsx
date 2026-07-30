import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import ErrorRetry from "../components/ui/ErrorRetry";
import PillTabs from "../components/ui/PillTabs";
import QuizCard from "../components/quizzes/QuizCard";
import QuizCardSkeleton from "../components/quizzes/QuizCardSkeleton";
import { fetchMyQuizzes, type QuizStatusFilter } from "../lib/quizzes";

interface FilterOption {
  label: string;
  value: QuizStatusFilter;
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
];

const SKELETON_COUNT = 6;

const EMPTY_MESSAGE: Record<QuizStatusFilter, string> = {
  all: "You haven't created any quizzes yet.",
  published: "You don't have any published quizzes yet.",
  draft: "You don't have any drafts yet.",
};

function MyQuizzes() {
  const [filter, setFilter] = useState<QuizStatusFilter>("all");

  const {
    data: quizzes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["quizzes", filter],
    queryFn: () => fetchMyQuizzes({ status: filter }),
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">My Quizzes</h1>
          <Link to="/quizzes/new">
            <Button>Create Quiz</Button>
          </Link>
        </div>

        <div className="mt-6">
          <PillTabs
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
          />
        </div>

        <div className="mt-8">
          {isLoading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <QuizCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <ErrorRetry
              message="Couldn't load your quizzes."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && quizzes && quizzes.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-muted">{EMPTY_MESSAGE[filter]}</p>
              <Link to="/quizzes/new">
                <Button>Create your first quiz</Button>
              </Link>
            </div>
          )}

          {!isLoading && !isError && quizzes && quizzes.length > 0 && (
            <div className="flex flex-col gap-4">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyQuizzes;
