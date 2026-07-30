import type { ReactNode } from "react";
import clsx from "clsx";

interface RankedListRowProps {
  highlighted?: boolean;
  left: ReactNode;
  right: ReactNode;
}

function RankedListRow({ highlighted, left, right }: RankedListRowProps) {
  return (
    <li
      className={clsx(
        "flex items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3",
        highlighted ? "border-primary" : "border-border",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">{left}</span>
      <span className="flex shrink-0 items-center gap-3">{right}</span>
    </li>
  );
}

export default RankedListRow;
