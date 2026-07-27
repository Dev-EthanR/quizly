import CategorySelect from "./publish/CategorySelect";
import DifficultySelect from "./publish/DifficultySelect";
import TagsInput from "./publish/TagsInput";
import { MAX_TAGS } from "./PublishQuizModal";
import type { UseTagInputResult } from "../../hooks/useTagInput";
import type { PublishMetadataErrors } from "../../lib/publishValidation";
import type { QuizCategory, QuizDifficulty } from "../../lib/quizzes";

interface PublishMetadataFieldsProps {
  category: QuizCategory | "";
  onCategoryChange: (value: QuizCategory | "") => void;
  difficulty: QuizDifficulty | null;
  onDifficultyChange: (value: QuizDifficulty) => void;
  tagState: UseTagInputResult;
  errors: PublishMetadataErrors | null;
}

function PublishMetadataFields({
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  tagState,
  errors,
}: PublishMetadataFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CategorySelect
          value={category}
          onChange={onCategoryChange}
          error={errors?.category}
        />
        <DifficultySelect
          value={difficulty}
          onChange={onDifficultyChange}
          error={errors?.difficulty}
        />
      </div>

      <TagsInput state={tagState} maxTags={MAX_TAGS} error={errors?.tags} />
    </div>
  );
}

export default PublishMetadataFields;
