import type { ButtonHTMLAttributes } from "react";
import { FiZap } from "react-icons/fi";
import clsx from "clsx";

type AiBadgeButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function AiBadgeButton({ className, children, ...props }: AiBadgeButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "flex w-fit cursor-pointer items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary/15",
        className,
      )}
      {...props}
    >
      <FiZap className="h-3.5 w-3.5 shrink-0" />
      {children}
    </button>
  );
}

export default AiBadgeButton;
