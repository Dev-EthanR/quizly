import clsx from "clsx";
import type { IconType } from "react-icons";
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import type { Achievement, AchievementId } from "../../lib/dashboard";

interface AchievementCardProps {
  achievement: Achievement;
}

const ACHIEVEMENT_ICONS: Record<AchievementId, IconType> = {
  first_win: FiAward,
  perfect_score: FiCheckCircle,
  speed_demon: FiZap,
  party_host: FiUsers,
  on_fire: FiTrendingUp,
  quiz_master: FiBookOpen,
};

function AchievementCard({ achievement }: AchievementCardProps) {
  const Icon = ACHIEVEMENT_ICONS[achievement.id];
  const progressPercent = Math.min(
    100,
    Math.round((achievement.progress / achievement.target) * 100),
  );

  return (
    <div
      className={clsx(
        "flex flex-col gap-3 rounded-xl border p-4 transition-colors",
        achievement.unlocked
          ? "border-secondary/40 bg-secondary/10"
          : "border-border bg-surface",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
            achievement.unlocked
              ? "bg-secondary/20 text-secondary"
              : "bg-chat text-muted",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate font-semibold text-foreground">
            {achievement.title}
          </h3>
          <p className="truncate text-sm text-muted">
            {achievement.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-chat">
          <div
            className={clsx(
              "h-full rounded-full",
              achievement.unlocked ? "bg-secondary" : "bg-primary",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-muted">
          {achievement.progress} / {achievement.target}
        </span>
      </div>
    </div>
  );
}

export default AchievementCard;
