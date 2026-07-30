import { useState } from "react";
import clsx from "clsx";
import { FiAward, FiBarChart2, FiFlag, FiTrendingUp } from "react-icons/fi";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import StatCard from "../components/dashboard/StatCard";
import AchievementCard from "../components/dashboard/AchievementCard";
import RecentGameRow from "../components/dashboard/RecentGameRow";
import HostedSessionRow from "../components/dashboard/HostedSessionRow";
import DashboardRowSkeleton from "../components/dashboard/DashboardRowSkeleton";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useRecentGames } from "../hooks/useRecentGames";
import { useHostedSessions } from "../hooks/useHostedSessions";
import type { Achievement } from "../lib/dashboard";

type DashboardTab = "recent" | "hosted" | "achievements";

interface TabOption {
  label: string;
  value: DashboardTab;
}

const TAB_OPTIONS: TabOption[] = [
  { label: "Recent Games", value: "recent" },
  { label: "Hosted Quizzes", value: "hosted" },
  { label: "Achievements", value: "achievements" },
];

const ROW_SKELETON_COUNT = 4;

function RecentGamesTab() {
  const [page, setPage] = useState(1);
  const { data: result, isLoading, isError, refetch } = useRecentGames(page);
  const games = result?.games;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: ROW_SKELETON_COUNT }).map((_, index) => (
          <DashboardRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-danger">Couldn't load your recent games.</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-muted">You haven't played any games yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {games.map((game) => (
          <RecentGameRow key={game.id} game={game} />
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
  );
}

function HostedQuizzesTab() {
  const [page, setPage] = useState(1);
  const { data: result, isLoading, isError, refetch } = useHostedSessions(page);
  const sessions = result?.sessions;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: ROW_SKELETON_COUNT }).map((_, index) => (
          <DashboardRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-danger">Couldn't load your hosted quizzes.</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-muted">You haven't hosted any games yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {sessions.map((session) => (
          <HostedSessionRow key={session.id} session={session} />
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
  );
}

interface AchievementsTabProps {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  achievements: Achievement[] | undefined;
}

function AchievementsTab({
  isLoading,
  isError,
  onRetry,
  achievements,
}: AchievementsTabProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-border bg-surface"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-danger">Couldn't load your achievements.</p>
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-muted">No achievements yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<DashboardTab>("recent");
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={FiBarChart2}
            label="Games Played"
            value={statsLoading ? "-" : (stats?.gamesPlayed ?? 0)}
          />
          <StatCard
            icon={FiTrendingUp}
            label="Average Score"
            value={statsLoading ? "-" : (stats?.averageScore ?? 0)}
          />
          <StatCard
            icon={FiFlag}
            label="Best Finish"
            value={statsLoading ? "-" : (stats?.bestFinish ?? "—")}
          />
          <StatCard
            icon={FiAward}
            label="Wins"
            value={statsLoading ? "-" : (stats?.wins ?? 0)}
          />
        </div>

        <div className="mt-8 flex gap-2">
          {TAB_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTab(option.value)}
              className={clsx(
                "cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                tab === option.value
                  ? "bg-primary text-foreground"
                  : "border border-border text-muted hover:bg-surface",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "recent" && <RecentGamesTab />}
          {tab === "hosted" && <HostedQuizzesTab />}
          {tab === "achievements" && (
            <AchievementsTab
              isLoading={statsLoading}
              isError={statsError}
              onRetry={() => refetchStats()}
              achievements={stats?.achievements}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
