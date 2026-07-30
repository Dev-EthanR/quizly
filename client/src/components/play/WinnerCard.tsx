import { FiAward } from "react-icons/fi";
import Avatar from "../ui/Avatar";
import { getInitials } from "../../lib/initials";

interface WinnerCardProps {
  name: string;
  avatarBgClass: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
}

function WinnerCard({
  name,
  avatarBgClass,
  score,
  correctCount,
  totalQuestions,
}: WinnerCardProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8">
      <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        <FiAward className="h-3.5 w-3.5" />
        Winner
      </span>
      <Avatar initials={getInitials(name)} bgClass={avatarBgClass} size="lg" />
      <span className="max-w-full truncate text-xl font-bold text-foreground">
        {name}
      </span>
      <span className="text-sm text-muted">
        {score} pts &middot; {correctCount}/{totalQuestions} correct
      </span>
    </div>
  );
}

export default WinnerCard;
