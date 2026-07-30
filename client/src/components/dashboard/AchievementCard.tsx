import clsx from "clsx";
import type { IconType } from "react-icons";
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiCheckSquare,
  FiChevronsUp,
  FiClock,
  FiCompass,
  FiCrosshair,
  FiFlag,
  FiGlobe,
  FiLayers,
  FiMonitor,
  FiPlay,
  FiRepeat,
  FiShield,
  FiTarget,
  FiThumbsUp,
  FiTrendingUp,
  FiUsers,
  FiWind,
  FiZap,
} from "react-icons/fi";
import type { Achievement, AchievementId } from "../../lib/dashboard";

interface AchievementCardProps {
  achievement: Achievement;
}

type AchievementCategory =
  | "participation"
  | "speed"
  | "hosting"
  | "streak"
  | "scoring"
  | "ranking";

interface CategoryStyle {
  iconBg: string;
  cardBorder: string;
}

const ACHIEVEMENT_ICONS: Record<AchievementId, IconType> = {
  rookie: FiPlay,
  first_win: FiAward,
  perfect_score: FiCheckCircle,
  speed_demon: FiZap,
  lightning_reflexes: FiClock,
  party_host: FiUsers,
  mega_host: FiGlobe,
  on_fire: FiTrendingUp,
  hot_streak: FiChevronsUp,
  unstoppable: FiWind,
  quiz_master: FiBookOpen,
  rising_host: FiCompass,
  veteran: FiRepeat,
  centurion: FiLayers,
  flawless_victory: FiCheckSquare,
  first_host: FiMonitor,
  sharpshooter: FiTarget,
  podium_finish: FiFlag,
  runner_up: FiCrosshair,
  underdog: FiShield,
  veteran_champion: FiThumbsUp,
};

const ACHIEVEMENT_CATEGORIES: Record<AchievementId, AchievementCategory> = {
  rookie: "participation",
  veteran: "participation",
  centurion: "participation",
  speed_demon: "speed",
  lightning_reflexes: "speed",
  party_host: "hosting",
  mega_host: "hosting",
  quiz_master: "hosting",
  rising_host: "hosting",
  first_host: "hosting",
  on_fire: "streak",
  hot_streak: "streak",
  unstoppable: "streak",
  perfect_score: "scoring",
  sharpshooter: "scoring",
  flawless_victory: "scoring",
  first_win: "ranking",
  podium_finish: "ranking",
  runner_up: "ranking",
  underdog: "ranking",
  veteran_champion: "ranking",
};

const CATEGORY_STYLES: Record<AchievementCategory, CategoryStyle> = {
  participation: {
    iconBg: "bg-[#3B82F6]",
    cardBorder: "border-[#3B82F6]/40",
  },
  speed: {
    iconBg: "bg-[#06B6D4]",
    cardBorder: "border-[#06B6D4]/40",
  },
  hosting: {
    iconBg: "bg-[#F97316]",
    cardBorder: "border-[#F97316]/40",
  },
  streak: {
    iconBg: "bg-[#EF4444]",
    cardBorder: "border-[#EF4444]/40",
  },
  scoring: {
    iconBg: "bg-[#7C3AED]",
    cardBorder: "border-[#7C3AED]/40",
  },
  ranking: {
    iconBg: "bg-[#22C55E]",
    cardBorder: "border-[#22C55E]/40",
  },
};

function AchievementCard({ achievement }: AchievementCardProps) {
  const Icon = ACHIEVEMENT_ICONS[achievement.id];
  const style = CATEGORY_STYLES[ACHIEVEMENT_CATEGORIES[achievement.id]];

  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-3 rounded-xl border bg-surface p-4 text-center transition-colors",
        achievement.unlocked ? style.cardBorder : "border-border opacity-50",
      )}
    >
      <div
        className={clsx(
          "flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-lg",
          achievement.unlocked ? [style.iconBg, "text-white"] : "bg-chat/60 text-muted/60",
        )}
      >
        <Icon className="h-7 w-7" />
      </div>

      <div className="flex min-w-0 flex-col">
        <h3
          className={clsx(
            "truncate font-semibold",
            achievement.unlocked ? "text-foreground" : "text-muted",
          )}
        >
          {achievement.title}
        </h3>
        <p className="truncate text-sm text-muted">
          {achievement.description}
        </p>
      </div>
    </div>
  );
}

export default AchievementCard;
