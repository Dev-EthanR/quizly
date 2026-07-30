import { FiAward } from "react-icons/fi";
import ErrorRetry from "../ui/ErrorRetry";
import AchievementCard from "./AchievementCard";
import EmptyState from "./EmptyState";
import type { Achievement } from "../../entities/dashboard";

const ACHIEVEMENT_SKELETON_COUNT = 6;

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
        {Array.from({ length: ACHIEVEMENT_SKELETON_COUNT }).map((_, index) => (
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

export default AchievementsTab;
