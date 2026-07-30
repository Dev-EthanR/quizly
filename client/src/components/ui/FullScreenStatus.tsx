import type { ReactNode } from "react";
import clsx from "clsx";

interface FullScreenStatusProps {
  icon: ReactNode;
  tone?: "danger" | "warning";
  title: ReactNode;
  titleClassName?: string;
  message?: ReactNode;
  secondaryMessage?: ReactNode;
  children?: ReactNode;
  variant?: "page" | "overlay" | "inline";
}

function FullScreenStatus({
  icon,
  tone = "danger",
  title,
  titleClassName = "text-2xl font-bold text-foreground",
  message,
  secondaryMessage,
  children,
  variant = "page",
}: FullScreenStatusProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-4 px-4 text-center",
        variant === "overlay" &&
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        variant === "page" && "min-h-screen",
        variant === "inline" && "py-24",
      )}
    >
      <div
        className={clsx(
          "flex h-16 w-16 items-center justify-center rounded-full border",
          tone === "warning"
            ? "border-warning/40 bg-warning/10 text-warning"
            : "border-danger/40 bg-danger/10 text-danger",
        )}
      >
        {icon}
      </div>

      <div className="flex flex-col gap-1">
        <h1 className={titleClassName}>{title}</h1>
        {message && <p className="text-muted">{message}</p>}
        {secondaryMessage && <p className="text-muted">{secondaryMessage}</p>}
      </div>

      {children}
    </div>
  );
}

export default FullScreenStatus;
