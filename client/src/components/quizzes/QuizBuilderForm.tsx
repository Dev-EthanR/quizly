import { Link } from "react-router-dom";
import Input from "../ui/Input";
import QuestionList from "./QuestionList";
import QuestionPreviewPanel from "./QuestionPreviewPanel";
import PublishQuizModal, { MAX_TAGS } from "./PublishQuizModal";
import PublishMetadataFields from "./PublishMetadataFields";
import QuizBuilderActionBar from "./QuizBuilderActionBar";
import CoverImageDropzone from "./publish/CoverImageDropzone";
import { useQuizBuilder } from "../../context/useQuizBuilder";
import { usePublishMetadataForm } from "../../hooks/usePublishMetadataForm";
import { useQuestionPreviewSelection } from "../../hooks/useQuestionPreviewSelection";
import { useQuizBuilderSave } from "../../hooks/useQuizBuilderSave";
import {
  getPublishMetadataErrors,
  type PublishMetadataDraft,
} from "../../lib/publishValidation";
import type { QuizDetail } from "../../lib/quizzes";

interface QuizBuilderFormProps {
  quizId?: string;
  quiz?: QuizDetail;
}

function QuizBuilderForm({ quizId, quiz }: QuizBuilderFormProps) {
  const { state, dispatch } = useQuizBuilder();
  const isPublished = quiz?.status === "published";

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
  } = usePublishMetadataForm({
    maxTags: MAX_TAGS,
    initial: quiz
      ? {
          category: quiz.category ?? undefined,
          difficulty: quiz.difficulty ?? undefined,
          tags: quiz.tags,
          visibility: quiz.visibility ?? undefined,
          coverImage: quiz.coverImage ?? undefined,
          description: quiz.description ?? undefined,
        }
      : undefined,
  });

  const metadataDraft: PublishMetadataDraft = {
    category,
    difficulty,
    tags: tagState.tags,
    visibility,
    coverImage: coverImageState.coverImage,
    description,
  };

  const {
    resolvedSelectedId,
    previewIndex,
    previewQuestion,
    setSelectedQuestionId,
    handleQuestionRemoved,
  } = useQuestionPreviewSelection(state.questions);

  const {
    validationErrors,
    isPublishModalOpen,
    closePublishModal,
    hasAttemptedSaveChanges,
    isSaving,
    isSaveError,
    handleSaveDraft,
    handleSaveChanges,
    handleOpenPublishModal,
    handleConfirmPublish,
  } = useQuizBuilderSave({
    quizId,
    metadataDraft,
    category,
    difficulty,
    tags: tagState.tags,
    visibility,
    coverImage: coverImageState.coverImage,
    description,
  });

  const metadataErrors = hasAttemptedSaveChanges
    ? getPublishMetadataErrors(metadataDraft)
    : null;

  return (
    <div className="mx-auto flex max-w-360 flex-col gap-8 px-4 py-10">
      <Link
        to="/my-quizzes"
        className="flex items-center gap-2 self-start text-sm font-semibold text-muted hover:text-foreground"
      >
        ← Back to My Quizzes
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
          <Input
            label="Quiz title"
            placeholder="e.g. Capital Cities of the World"
            value={state.title}
            onChange={(event) =>
              dispatch({ type: "SET_TITLE", title: event.target.value })
            }
            className="w-full"
          />

          {isPublished && (
            <PublishMetadataFields
              category={category}
              onCategoryChange={setCategory}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              description={description}
              onDescriptionChange={setDescription}
              tagState={tagState}
              errors={metadataErrors}
            />
          )}

          <QuestionList
            selectedQuestionId={resolvedSelectedId}
            onSelectQuestion={setSelectedQuestionId}
            onQuestionRemoved={handleQuestionRemoved}
          />
        </div>

        <div className="flex flex-col gap-6">
          {isPublished && <CoverImageDropzone dropzone={coverImageState} />}
          <QuestionPreviewPanel question={previewQuestion} index={previewIndex} />
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 p-4">
          <ul className="list-inside list-disc text-sm text-danger">
            {validationErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {isSaveError && (
        <p className="text-sm text-danger">Couldn't save quiz. Try again.</p>
      )}

      <QuizBuilderActionBar
        isPublished={isPublished}
        isSaving={isSaving}
        quizId={quizId}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        onSave={isPublished ? handleSaveChanges : handleSaveDraft}
        onOpenPublishModal={handleOpenPublishModal}
      />

      {isPublishModalOpen && (
        <PublishQuizModal
          onClose={closePublishModal}
          onConfirm={handleConfirmPublish}
          isSubmitting={isSaving}
        />
      )}
    </div>
  );
}

export default QuizBuilderForm;
