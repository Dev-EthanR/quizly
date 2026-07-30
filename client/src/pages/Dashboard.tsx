import { useState } from "react";
import clsx from "clsx";
import {
  FiAward,
  FiBarChart2,
  FiFlag,
  FiPlay,
  FiTrendingUp,
  FiVideo,
} from "react-icons/fi";
import Navbar from "../components/layout/Navbar";
import ErrorRetry from "../components/ui/ErrorRetry";
import Pagination from "../components/ui/Pagination";
import StatTile from "../components/ui/StatTile";
import AchievementCard from "../components/dashboard/AchievementCard";
import RecentGameRow from "../components/dashboard/RecentGameRow";
import HostedSessionRow from "../components/dashboard/HostedSessionRow";
import DashboardRowSkeleton from "../components/dashboard/DashboardRowSkeleton";
import EmptyState from "../components/dashboard/EmptyState";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useRecentGames } from "../hooks/useRecentGames";
import { useHostedSessions } from "../hooks/useHostedSessions";
import type { Achievement } from "../entities/dashboard";

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
      <ErrorRetry
        message="Couldn't load your recent games."
        onRetry={() => refetch()}
      />
    );
  }

  if (!games || games.length === 0) {
    return (
      <EmptyState
        icon={FiPlay}
        title="No games played yet"
        description="Join a live quiz with a room code and your results will show up here."
        action={{ label: "Join a game", to: "/" }}
      />
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
      <ErrorRetry
        message="Couldn't load your hosted quizzes."
        onRetry={() => refetch()}
      />
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        icon={FiVideo}
        title="No hosted games yet"
        description="Host a quiz from your library and it will show up here once the game ends."
        action={{ label: "Go to My Quizzes", to: "/my-quizzes" }}
      />
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
      <ErrorRetry message="Couldn't load your achievements." onRetry={onRetry} />
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <EmptyState
        icon={FiAward}
        title="No achievements available"
        description="Play or host a few games to start unlocking achievements."
      />
    );
  }

  const sortedAchievements = [...achievements].sort(
    (a, b) => Number(b.unlocked) - Number(a.unlocked),
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sortedAchievements.map((achievement) => (
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
          <StatTile
            layout="row"
            icon={<FiBarChart2 className="h-5 w-5" />}
            label="Games Played"
            value={statsLoading ? "-" : (stats?.gamesPlayed ?? 0)}
          />
          <StatTile
            layout="row"
            icon={<FiTrendingUp className="h-5 w-5" />}
            label="Average Score"
            value={statsLoading ? "-" : (stats?.averageScore ?? 0)}
          />
          <StatTile
            layout="row"
            icon={<FiFlag className="h-5 w-5" />}
            label="Best Finish"
            value={statsLoading ? "-" : (stats?.bestFinish ?? "—")}
          />
          <StatTile
            layout="row"
            icon={<FiAward className="h-5 w-5" />}
            label="Wins"
            value={statsLoading ? "-" : (stats?.wins ?? 0)}
          />
        </div>

        <div className="mt-8 flex gap-6 border-b border-border">
          {TAB_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTab(option.value)}
              className={clsx(
                "-mb-px cursor-pointer border-b-2 pb-3 text-sm font-semibold transition-colors",
                tab === option.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
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
