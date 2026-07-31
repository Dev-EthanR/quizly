import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DISCOVER_QUIZZES_PAGE_SIZE, quizDifficultyLabels } from "shared";
import ErrorRetry from "../ui/ErrorRetry";
import Pagination from "../ui/Pagination";
import DiscoveryQuizCard from "./DiscoveryQuizCard";
import DiscoveryQuizCardSkeleton from "./DiscoveryQuizCardSkeleton";
import { useQuizCategories } from "../../hooks/useQuizCategories";
import { fetchDiscoverQuizzes } from "../../lib/quizzes";
import type { QuizCategory, QuizDifficulty } from "../../entities/quiz";

const SKELETON_COUNT = DISCOVER_QUIZZES_PAGE_SIZE;
const DIFFICULTY_OPTIONS: QuizDifficulty[] = ["easy", "medium", "hard"];
const SEARCH_DEBOUNCE_MS = 300;

function BrowseQuizzesTab() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<QuizCategory | "">("");
  const [difficulty, setDifficulty] = useState<QuizDifficulty | "">("");
  const [page, setPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    search,
    category,
    difficulty,
  });

  useEffect(() => {
    const timeout = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [searchInput]);

  if (
    appliedFilters.search !== search ||
    appliedFilters.category !== category ||
    appliedFilters.difficulty !== difficulty
  ) {
    setAppliedFilters({ search, category, difficulty });
    setPage(1);
  }

  const categoriesQuery = useQuizCategories();

  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["discover-quizzes", search, category, difficulty, page],
    queryFn: () =>
      fetchDiscoverQuizzes({
        search: search || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        page,
      }),
    placeholderData: keepPreviousData,
  });

  const quizzes = result?.quizzes;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by title or tag..."
          className="field-input min-w-48 flex-1 placeholder:text-muted"
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as QuizCategory | "")
          }
          className="field-input"
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
          className="field-input"
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
          <ErrorRetry
            message="Couldn't load quizzes."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && quizzes && quizzes.length === 0 && (
          <div className="empty-state">
            <p className="text-muted">No quizzes found.</p>
          </div>
        )}

        {!isLoading && !isError && quizzes && quizzes.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {quizzes.map((quiz) => (
                <DiscoveryQuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>

            <div className="mt-8">
              <Pagination
                page={page}
                totalPages={result?.totalPages ?? 1}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default BrowseQuizzesTab;
