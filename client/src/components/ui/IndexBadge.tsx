import type { ReactNode } from "react";
import clsx from "clsx";

interface IndexBadgeProps {
  children: ReactNode;
  variant?: "default" | "correct";
  shape?: "square" | "pill";
  size?: "sm" | "md";
}

const sizeClasses: Record<NonNullable<IndexBadgeProps["size"]>, string> = {
  sm: "text-xs",
  md: "text-sm",
};

function IndexBadge({
  children,
  variant = "default",
  shape = "square",
  size = "sm",
}: IndexBadgeProps) {
  return (
    <span
      className={clsx(
        "flex shrink-0 items-center justify-center border font-bold",
        sizeClasses[size],
        shape === "pill" ? "rounded-full px-3 py-1" : "h-8 w-8 rounded-lg",
        variant === "correct"
          ? "border-secondary bg-secondary text-black"
          : "border-primary/40 bg-primary/15 text-primary",
      )}
    >
      {children}
    </span>
  );
}

export default IndexBadge;
