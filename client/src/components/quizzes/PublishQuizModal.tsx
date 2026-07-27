import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import VisibilitySelect from "./publish/VisibilitySelect";
import CategorySelect from "./publish/CategorySelect";
import CoverImageDropzone from "./publish/CoverImageDropzone";
import DifficultySelect from "./publish/DifficultySelect";
import TagsInput from "./publish/TagsInput";
import { useCoverImageDropzone } from "../../hooks/useCoverImageDropzone";
import { useTagInput } from "../../hooks/useTagInput";
import type {
  PublishQuizMetadata,
  QuizCategory,
  QuizDifficulty,
  QuizVisibility,
} from "../../lib/quizzes";
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

const MAX_TAGS = 10;

function PublishQuizModal({ onClose, onConfirm, isSubmitting }: PublishQuizModalProps) {
  const [category, setCategory] = useState<QuizCategory | "">("");
  const [difficulty, setDifficulty] = useState<QuizDifficulty | null>(null);
  const [visibility, setVisibility] = useState<QuizVisibility>("public");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const tagState = useTagInput({ maxTags: MAX_TAGS });
  const coverImageState = useCoverImageDropzone();

  const draft: PublishMetadataDraft = {
    category,
    difficulty,
    tags: tagState.tags,
    visibility,
    coverImage: coverImageState.coverImage,
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

        <TagsInput state={tagState} maxTags={MAX_TAGS} error={errors?.tags} />
      </div>
    </Modal>
  );
}

export default PublishQuizModal;
