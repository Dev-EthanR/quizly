import type { ReactNode } from "react";

interface StatTileProps {
  icon: ReactNode;
  value: string;
  label: string;
}

function StatTile({ icon, value, label }: StatTileProps) {
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
