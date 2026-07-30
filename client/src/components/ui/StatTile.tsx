import type { ReactNode } from "react";

interface StatTileProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  layout?: "square" | "row" | "compact";
}

function StatTile({ icon, value, label, layout = "square" }: StatTileProps) {
  if (layout === "row") {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          {icon}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-2xl font-bold text-foreground">
            {value}
          </span>
          <span className="truncate text-sm text-muted">{label}</span>
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface px-4 py-5 text-center">
        <span className="text-primary">{icon}</span>
        <span className="text-xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon}
      </span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export default StatTile;
