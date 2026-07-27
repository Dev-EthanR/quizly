import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { quizDifficultyLabels } from "shared";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import DiscoveryQuizCard from "../components/quizzes/DiscoveryQuizCard";
import DiscoveryQuizCardSkeleton from "../components/quizzes/DiscoveryQuizCardSkeleton";
import { useQuizCategories } from "../hooks/useQuizCategories";
import {
  fetchDiscoverQuizzes,
  type QuizCategory,
  type QuizDifficulty,
} from "../lib/quizzes";

const SKELETON_COUNT = 8;
const DIFFICULTY_OPTIONS: QuizDifficulty[] = ["easy", "medium", "hard"];
const SEARCH_DEBOUNCE_MS = 300;

function Discovery() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<QuizCategory | "">("");
  const [difficulty, setDifficulty] = useState<QuizDifficulty | "">("");

  useEffect(() => {
    const timeout = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const categoriesQuery = useQuizCategories();

  const {
    data: quizzes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["discover-quizzes", search, category, difficulty],
    queryFn: () =>
      fetchDiscoverQuizzes({
        search: search || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
      }),
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-360 px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground">Discover Quizzes</h1>

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search quizzes..."
            className="min-w-48 flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as QuizCategory | "")
            }
            className="rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All categories</option>
            {categoriesQuery.data?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as QuizDifficulty | "")
            }
            className="rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All difficulties</option>
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {quizDifficultyLabels[option]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <DiscoveryQuizCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-danger">Couldn't load quizzes.</p>
              <Button variant="secondary" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !isError && quizzes && quizzes.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-muted">No quizzes found.</p>
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
      </div>
    </div>
  );
}

export default Discovery;
