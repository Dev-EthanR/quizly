import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import clsx from "clsx";

interface SegmentedControlOption<T extends string | number> {
  value: T;
  label: ReactNode;
  icon?: IconType;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentedControlOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  tone?: "primary" | "secondary";
  fullWidth?: boolean;
  size?: "sm" | "md";
}

const selectedClasses = {
  primary: "border-primary/40 bg-primary/15 text-primary",
  secondary: "border-secondary bg-secondary/15 text-secondary",
} as const;

const unselectedClasses = {
  primary: "border-border text-muted hover:bg-background",
  secondary: "border-border text-muted hover:bg-surface",
} as const;

const sizeClasses = {
  sm: "py-2",
  md: "py-3",
} as const;

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  tone = "primary",
  fullWidth = true,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition-colors",
              sizeClasses[size],
              fullWidth && "flex-1",
              isSelected ? selectedClasses[tone] : unselectedClasses[tone],
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
