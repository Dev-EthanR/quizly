import clsx from "clsx";
import type { QuizDifficulty } from "../../../lib/quizzes";

interface DifficultyOption {
  value: QuizDifficulty;
  label: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

interface DifficultySelectProps {
  value: QuizDifficulty | null;
  onChange: (value: QuizDifficulty) => void;
  error?: string;
}

function DifficultySelect({ value, onChange, error }: DifficultySelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-muted">Difficulty</span>
      <div className="flex gap-2">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              "flex-1 cursor-pointer rounded-lg border px-4 py-2 text-sm font-bold transition-colors",
              value === option.value
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border text-muted hover:bg-background",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

export default DifficultySelect;
