import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DISCOVER_QUIZZES_PAGE_SIZE, quizDifficultyLabels } from "shared";
import Navbar from "../components/layout/Navbar";
import ErrorRetry from "../components/ui/ErrorRetry";
import Pagination from "../components/ui/Pagination";
import PillTabs from "../components/ui/PillTabs";
import DiscoveryQuizCard from "../components/quizzes/DiscoveryQuizCard";
import DiscoveryQuizCardSkeleton from "../components/quizzes/DiscoveryQuizCardSkeleton";
import { useQuizCategories } from "../hooks/useQuizCategories";
import {
  fetchDiscoverQuizzes,
  fetchSavedQuizzes,
  type QuizCategory,
  type QuizDifficulty,
} from "../lib/quizzes";

type DiscoveryTab = "browse" | "saved";

interface TabOption {
  label: string;
  value: DiscoveryTab;
}

const TAB_OPTIONS: TabOption[] = [
  { label: "Browse", value: "browse" },
  { label: "Saved", value: "saved" },
];

const SKELETON_COUNT = DISCOVER_QUIZZES_PAGE_SIZE;
const DIFFICULTY_OPTIONS: QuizDifficulty[] = ["easy", "medium", "hard"];
const SEARCH_DEBOUNCE_MS = 300;

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
          {Array.from({ length: 3 }).map((_, index) => (
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

function Discovery() {
  const [tab, setTab] = useState<DiscoveryTab>("browse");
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
    enabled: tab === "browse",
  });

  const quizzes = result?.quizzes;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-360 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">Discover Quizzes</h1>

          <PillTabs options={TAB_OPTIONS} value={tab} onChange={setTab} />
        </div>

        {tab === "saved" && <SavedQuizzesTab />}

        {tab === "browse" && (
          <>
            <div className="mt-6 flex flex-wrap gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by title or tag..."
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
                <ErrorRetry
                  message="Couldn't load quizzes."
                  onRetry={() => refetch()}
                />
              )}

              {!isLoading && !isError && quizzes && quizzes.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-24 text-center">
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
        )}
      </div>
    </div>
  );
}

export default Discovery;
