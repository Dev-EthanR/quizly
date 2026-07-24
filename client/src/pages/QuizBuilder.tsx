import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { publishQuizContentSchema, publishQuizSchema, saveQuizDraftSchema } from "shared";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import QuestionList from "../components/quizzes/QuestionList";
import QuestionPreviewPanel from "../components/quizzes/QuestionPreviewPanel";
import PublishQuizModal from "../components/quizzes/PublishQuizModal";
import { QuizBuilderProvider } from "../context/QuizBuilderContext";
import { useQuizBuilder } from "../context/useQuizBuilder";
import {
  createQuiz,
  type PublishQuizMetadata,
  type SaveQuizPayload,
} from "../lib/quizzes";

interface QuizBuilderRouteParams {
  quizId?: string;
  [key: string]: string | undefined;
}

function QuizBuilderForm() {
  const { state, dispatch } = useQuizBuilder();
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const resolvedSelectedId = selectedQuestionId ?? state.questions[0]?.id ?? null;
  const previewIndex = state.questions.findIndex(
    (question) => question.id === resolvedSelectedId,
  );
  const previewQuestion = previewIndex >= 0 ? state.questions[previewIndex] : null;

  const handleQuestionRemoved = (questionId: string) => {
    if (selectedQuestionId === questionId) setSelectedQuestionId(null);
  };

  const saveMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: (result) => {
      navigate(`/quizzes/${result.id}/edit`, { replace: true });
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

          <QuestionList
            selectedQuestionId={resolvedSelectedId}
            onSelectQuestion={setSelectedQuestionId}
            onQuestionRemoved={handleQuestionRemoved}
          />
        </div>

        <QuestionPreviewPanel question={previewQuestion} index={previewIndex} />
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

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-background py-4">
        <Button
          type="button"
          variant="secondary"
          disabled={saveMutation.isPending}
          onClick={handleSaveDraft}
        >
          {saveMutation.isPending ? "Saving..." : "Save draft"}
        </Button>
        <Button
          type="button"
          disabled={saveMutation.isPending}
          onClick={handleOpenPublishModal}
        >
          {saveMutation.isPending ? "Publishing..." : "Publish"}
        </Button>
      </div>

      {isPublishModalOpen && (
        <PublishQuizModal
          onClose={() => setIsPublishModalOpen(false)}
          onConfirm={handleConfirmPublish}
          isSubmitting={saveMutation.isPending}
        />
      )}
    </div>
  );
}

function QuizBuilder() {
  const { quizId } = useParams<QuizBuilderRouteParams>();

  return (
    <div className="min-h-screen">
      <Navbar />
      {quizId ? (
        <div className="flex items-center justify-center px-4 py-24">
          <p className="text-muted">Editing existing quizzes is coming soon.</p>
        </div>
      ) : (
        <QuizBuilderProvider>
          <QuizBuilderForm />
        </QuizBuilderProvider>
      )}
    </div>
  );
}

export default QuizBuilder;
