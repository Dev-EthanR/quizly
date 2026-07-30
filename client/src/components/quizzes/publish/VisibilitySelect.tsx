import clsx from "clsx";
import { FiGlobe, FiLock } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { QuizVisibility } from "../../../lib/quizzes";
import SegmentedControl from "../../ui/SegmentedControl";

interface VisibilityOption {
  value: QuizVisibility;
  label: string;
  description: string;
  icon: IconType;
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can see and host it.",
    icon: FiGlobe,
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can see and host it.",
    icon: FiLock,
  },
];

interface VisibilitySelectProps {
  value: QuizVisibility;
  onChange: (value: QuizVisibility) => void;
  compact?: boolean;
}

function VisibilitySelect({ value, onChange, compact = false }: VisibilitySelectProps) {
  if (compact) {
    return (
      <SegmentedControl
        options={VISIBILITY_OPTIONS}
        value={value}
        onChange={onChange}
        tone="secondary"
        fullWidth={false}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-muted">Visibility</span>
      <div className="flex flex-col gap-3">
        {VISIBILITY_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={clsx(
                "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-secondary bg-secondary/15"
                  : "border-border hover:border-secondary/40",
              )}
            >
              <Icon
                className={clsx(
                  "mt-0.5 h-5 w-5 shrink-0",
                  isSelected ? "text-secondary" : "text-muted",
                )}
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-bold text-foreground">{option.label}</span>
                <span className="text-xs text-muted">{option.description}</span>
              </div>
              <span
                className={clsx(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                  isSelected ? "border-secondary bg-secondary" : "border-border",
                )}
              >
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VisibilitySelect;
