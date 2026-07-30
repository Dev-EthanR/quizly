import type { MouseEvent } from "react";
import { FiX } from "react-icons/fi";

interface TagPillProps {
  tag: string;
  onRemove?: () => void;
}

function TagPill({ tag, onRemove }: TagPillProps) {
  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.();
  };

  return (
    <span className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
      #{tag}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemoveClick}
          aria-label={`Remove tag ${tag}`}
          className="cursor-pointer text-primary hover:text-foreground"
        >
          <FiX className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export default TagPill;
