import CategorySelect from "./publish/CategorySelect";
import DescriptionInput from "./publish/DescriptionInput";
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
  description: string;
  onDescriptionChange: (value: string) => void;
  tagState: UseTagInputResult;
  errors: PublishMetadataErrors | null;
}

function PublishMetadataFields({
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  description,
  onDescriptionChange,
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

      <DescriptionInput
        value={description}
        onChange={onDescriptionChange}
        error={errors?.description}
      />

      <TagsInput state={tagState} maxTags={MAX_TAGS} error={errors?.tags} />
    </div>
  );
}

export default PublishMetadataFields;
