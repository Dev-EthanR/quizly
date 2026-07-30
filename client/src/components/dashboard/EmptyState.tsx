import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import Button from "../ui/Button";

interface EmptyStateAction {
  label: string;
  to: string;
}

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="max-w-sm text-sm text-muted">{description}</p>
      </div>
      {action && (
        <Link to={action.to}>
          <Button type="button">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
