import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
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

        <div className="mt-6 flex gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={clsx(
                "cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                filter === option.value
                  ? "bg-primary text-foreground"
                  : "border border-border text-muted hover:bg-surface",
              )}
            >
              {option.label}
            </button>
          ))}
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
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-danger">Couldn't load your quizzes.</p>
              <Button variant="secondary" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
