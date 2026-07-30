import type { IconType } from "react-icons";

interface StatCardProps {
  icon: IconType;
  label: string;
  value: string | number;
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
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

export default StatCard;
