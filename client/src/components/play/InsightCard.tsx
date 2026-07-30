import type { ReactNode } from "react";
import clsx from "clsx";

interface InsightCardProps {
  icon: ReactNode;
  tone: "secondary" | "danger";
  label: string;
  value: ReactNode;
}

function InsightCard({ icon, tone, label, value }: InsightCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <span
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          tone === "secondary"
            ? "bg-secondary/15 text-secondary"
            : "bg-danger/15 text-danger",
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-muted">{label}</span>
        <span className="truncate font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
}

export default InsightCard;
