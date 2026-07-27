import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { publishQuizContentSchema, publishQuizSchema, saveQuizDraftSchema } from "shared";
import { FiPlay } from "react-icons/fi";
import clsx from "clsx";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import QuestionList from "../components/quizzes/QuestionList";
import QuestionPreviewPanel from "../components/quizzes/QuestionPreviewPanel";
import PublishQuizModal, { MAX_TAGS } from "../components/quizzes/PublishQuizModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import VisibilitySelect from "../components/quizzes/publish/VisibilitySelect";
import CategorySelect from "../components/quizzes/publish/CategorySelect";
import CoverImageDropzone from "../components/quizzes/publish/CoverImageDropzone";
import DifficultySelect from "../components/quizzes/publish/DifficultySelect";
import TagsInput from "../components/quizzes/publish/TagsInput";
import { QuizBuilderProvider } from "../context/QuizBuilderContext";
import { useQuizBuilder } from "../context/useQuizBuilder";
import { usePublishMetadataForm } from "../hooks/usePublishMetadataForm";
import { hydrateBuilderState } from "../lib/quizBuilderReducer";
import {
  getPublishMetadataErrors,
  isPublishMetadataValid,
  type PublishMetadataDraft,
} from "../lib/publishValidation";
import {
  createQuiz,
  fetchQuizById,
  publishQuiz,
  updateQuizDraft,
  type PublishQuizMetadata,
  type QuizCategory,
  type QuizDetail,
  type QuizDifficulty,
  type QuizVisibility,
  type SaveQuizPayload,
} from "../lib/quizzes";

interface QuizBuilderRouteParams {
  quizId?: string;
  [key: string]: string | undefined;
}

interface QuizBuilderFormProps {
  quizId?: string;
  quiz?: QuizDetail;
}

function QuizBuilderForm({ quizId, quiz }: QuizBuilderFormProps) {
  const { state, dispatch } = useQuizBuilder();
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [hasAttemptedSaveChanges, setHasAttemptedSaveChanges] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<QuizVisibility | null>(
    null,
  );

  const isPublished = quiz?.status === "published";

  const {
    category,
    setCategory,
    difficulty,
    setDifficulty,
    visibility,
    setVisibility,
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
        }
      : undefined,
  });

  const metadataDraft: PublishMetadataDraft = {
    category,
    difficulty,
    tags: tagState.tags,
    visibility,
    coverImage: coverImageState.coverImage,
  };
  const metadataErrors = hasAttemptedSaveChanges
    ? getPublishMetadataErrors(metadataDraft)
    : null;

  const resolvedSelectedId = selectedQuestionId ?? state.questions[0]?.id ?? null;
  const previewIndex = state.questions.findIndex(
    (question) => question.id === resolvedSelectedId,
  );
  const previewQuestion = previewIndex >= 0 ? state.questions[previewIndex] : null;

  const handleQuestionRemoved = (questionId: string) => {
    if (selectedQuestionId === questionId) setSelectedQuestionId(null);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: SaveQuizPayload) => {
      if (!quizId) return createQuiz(payload);
      return payload.status === "published"
        ? publishQuiz({ id: quizId, payload })
        : updateQuizDraft({ id: quizId, payload });
    },
    onSuccess: (result) => {
      if (!quizId) navigate(`/quizzes/${result.id}/edit`, { replace: true });
    },
  });

  const handleSaveDraft = () => {
    const payload: SaveQuizPayload = { ...state, status: "draft" };
    const parsed = saveQuizDraftSchema.safeParse(payload);

    if (!parsed.success) {
      setValidationErrors(
        Array.from(new Set(parsed.error.issues.map((issue) => issue.message))),
      );
      return;
    }

    setValidationErrors([]);
    saveMutation.mutate(payload);
  };

  const handleSaveChanges = () => {
    if (!isPublishMetadataValid(metadataDraft)) {
      setHasAttemptedSaveChanges(true);
      return;
    }

    const payload: SaveQuizPayload = {
      ...state,
      status: "published",
      category: category as QuizCategory,
      difficulty: difficulty as QuizDifficulty,
      tags: tagState.tags,
      visibility,
      coverImage: coverImageState.coverImage,
    };
    const parsed = publishQuizSchema.safeParse(payload);

    if (!parsed.success) {
      setValidationErrors(
        Array.from(new Set(parsed.error.issues.map((issue) => issue.message))),
      );
      return;
    }

    setValidationErrors([]);
    setHasAttemptedSaveChanges(false);
    saveMutation.mutate(payload);
  };

  const handleOpenPublishModal = () => {
    const parsed = publishQuizContentSchema.safeParse(state);

    if (!parsed.success) {
      setValidationErrors(
        Array.from(new Set(parsed.error.issues.map((issue) => issue.message))),
      );
      return;
    }

    setValidationErrors([]);
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = (metadata: PublishQuizMetadata) => {
    const payload: SaveQuizPayload = { ...state, status: "published", ...metadata };
    const parsed = publishQuizSchema.safeParse(payload);

    if (!parsed.success) {
      setValidationErrors(
        Array.from(new Set(parsed.error.issues.map((issue) => issue.message))),
      );
      setIsPublishModalOpen(false);
      return;
    }

    setValidationErrors([]);
    setIsPublishModalOpen(false);
    saveMutation.mutate(payload);
  };

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
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CategorySelect
                  value={category}
                  onChange={setCategory}
                  error={metadataErrors?.category}
                />
                <DifficultySelect
                  value={difficulty}
                  onChange={setDifficulty}
                  error={metadataErrors?.difficulty}
                />
              </div>

              <TagsInput
                state={tagState}
                maxTags={MAX_TAGS}
                error={metadataErrors?.tags}
              />
            </div>
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

      {saveMutation.isError && (
        <p className="text-sm text-danger">Couldn't save quiz. Try again.</p>
      )}

      <div
        className={clsx(
          "sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-border bg-background py-4",
          isPublished ? "justify-between" : "justify-end",
        )}
      >
        {isPublished && (
          <VisibilitySelect
            value={visibility}
            onChange={(value) => {
              if (value !== visibility) setPendingVisibility(value);
            }}
            compact
          />
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={saveMutation.isPending}
            onClick={isPublished ? handleSaveChanges : handleSaveDraft}
          >
            {saveMutation.isPending
              ? "Saving..."
              : isPublished
                ? "Save changes"
                : "Save draft"}
          </Button>
          {isPublished ? (
            <Link to={`/host/${quizId}`}>
              <Button type="button" className="flex items-center gap-2">
                <FiPlay className="h-4 w-4" />
                Host
              </Button>
            </Link>
          ) : (
            <Button
              type="button"
              disabled={saveMutation.isPending}
              onClick={handleOpenPublishModal}
            >
              {saveMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          )}
        </div>
      </div>

      {isPublishModalOpen && (
        <PublishQuizModal
          onClose={() => setIsPublishModalOpen(false)}
          onConfirm={handleConfirmPublish}
          isSubmitting={saveMutation.isPending}
        />
      )}

      {pendingVisibility && (
        <ConfirmDialog
          title="Change quiz visibility?"
          message={
            pendingVisibility === "private"
              ? "This quiz will no longer appear on the Discovery page, and only you will be able to host it."
              : "This quiz will become visible to everyone on the Discovery page and can be hosted by anyone."
          }
          confirmLabel={pendingVisibility === "private" ? "Make private" : "Make public"}
          onConfirm={() => {
            setVisibility(pendingVisibility);
            setPendingVisibility(null);
          }}
          onCancel={() => setPendingVisibility(null)}
        />
      )}
    </div>
  );
}

interface QuizBuilderEditLoaderProps {
  quizId: string;
}

function QuizBuilderEditLoader({ quizId }: QuizBuilderEditLoaderProps) {
  const {
    data: quiz,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => fetchQuizById(quizId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <p className="text-muted">Loading quiz...</p>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
        <p className="text-danger">Couldn't load this quiz.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
          <Link to="/my-quizzes">
            <Button variant="secondary">Back to My Quizzes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <QuizBuilderProvider initialState={hydrateBuilderState(quiz)}>
      <QuizBuilderForm quizId={quizId} quiz={quiz} />
    </QuizBuilderProvider>
  );
}

function QuizBuilder() {
  const { quizId } = useParams<QuizBuilderRouteParams>();

  return (
    <div className="min-h-screen">
      <Navbar />
      {quizId ? (
        <QuizBuilderEditLoader quizId={quizId} />
      ) : (
        <QuizBuilderProvider>
          <QuizBuilderForm />
        </QuizBuilderProvider>
      )}
    </div>
  );
}

export default QuizBuilder;
