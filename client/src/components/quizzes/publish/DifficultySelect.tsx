import type { QuizDifficulty } from "../../../entities/quiz";
import SegmentedControl from "../../ui/SegmentedControl";

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
      <SegmentedControl
        options={DIFFICULTY_OPTIONS}
        value={value}
        onChange={onChange}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

export default DifficultySelect;
