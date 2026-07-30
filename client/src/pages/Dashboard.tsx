import { useState } from "react";
import clsx from "clsx";
import { FiAward, FiBarChart2, FiFlag, FiTrendingUp } from "react-icons/fi";
import Navbar from "../components/layout/Navbar";
import StatTile from "../components/ui/StatTile";
import RecentGamesTab from "../components/dashboard/RecentGamesTab";
import HostedQuizzesTab from "../components/dashboard/HostedQuizzesTab";
import AchievementsTab from "../components/dashboard/AchievementsTab";
import { useDashboardStats } from "../hooks/useDashboardStats";

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
