import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import VisibilitySelect from "./publish/VisibilitySelect";
import CategorySelect from "./publish/CategorySelect";
import CoverImageDropzone from "./publish/CoverImageDropzone";
import DescriptionInput from "./publish/DescriptionInput";
import DifficultySelect from "./publish/DifficultySelect";
import TagsInput from "./publish/TagsInput";
import { usePublishMetadataForm } from "../../hooks/usePublishMetadataForm";
import type { PublishQuizMetadata, QuizCategory, QuizDifficulty } from "../../lib/quizzes";
import {
  getPublishMetadataErrors,
  isPublishMetadataValid,
  type PublishMetadataDraft,
} from "../../lib/publishValidation";

interface PublishQuizModalProps {
  onClose: () => void;
  onConfirm: (metadata: PublishQuizMetadata) => void;
  isSubmitting: boolean;
}

export const MAX_TAGS = 10;

function PublishQuizModal({ onClose, onConfirm, isSubmitting }: PublishQuizModalProps) {
  const {
    category,
    setCategory,
    difficulty,
    setDifficulty,
    visibility,
    setVisibility,
    description,
    setDescription,
    tagState,
    coverImageState,
  } = usePublishMetadataForm({ maxTags: MAX_TAGS });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const draft: PublishMetadataDraft = {
    category,
    difficulty,
    tags: tagState.tags,
    visibility,
    coverImage: coverImageState.coverImage,
    description,
  };
  const errors = hasAttemptedSubmit ? getPublishMetadataErrors(draft) : null;

  const handleSubmit = () => {
    if (!isPublishMetadataValid(draft)) {
      setHasAttemptedSubmit(true);
      return;
    }
    onConfirm({
      category: category as QuizCategory,
      difficulty: difficulty as QuizDifficulty,
      tags: tagState.tags,
      visibility,
      coverImage: coverImageState.coverImage,
      description: description || undefined,
    });
  };

  return (
    <Modal
      title="Publish quiz"
      ariaLabel="Publish quiz"
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.3fr]">
          <VisibilitySelect value={visibility} onChange={setVisibility} />

          <div className="flex flex-col gap-6">
            <CategorySelect value={category} onChange={setCategory} error={errors?.category} />
            <CoverImageDropzone dropzone={coverImageState} />
            <DifficultySelect
              value={difficulty}
              onChange={setDifficulty}
              error={errors?.difficulty}
            />
          </div>
        </div>

        <DescriptionInput
          value={description}
          onChange={setDescription}
          error={errors?.description}
        />

        <TagsInput state={tagState} maxTags={MAX_TAGS} error={errors?.tags} />
      </div>
    </Modal>
  );
}

export default PublishQuizModal;
