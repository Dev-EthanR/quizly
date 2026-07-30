import clsx from "clsx";
import type { QuizStatus } from "../../entities/quiz";

interface QuizStatusBadgeProps {
  status: QuizStatus;
}

const STATUS_LABEL: Record<QuizStatus, string> = {
  draft: "Draft",
  published: "Published",
};

function QuizStatusBadge({ status }: QuizStatusBadgeProps) {
  return (
    <span
      className={clsx(
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "published"
          ? "bg-secondary/15 text-secondary"
          : "bg-muted/15 text-muted",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default QuizStatusBadge;
