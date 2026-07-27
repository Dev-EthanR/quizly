import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { publishQuizContentSchema, publishQuizSchema, saveQuizDraftSchema } from "shared";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import QuestionList from "../components/quizzes/QuestionList";
import QuestionPreviewPanel from "../components/quizzes/QuestionPreviewPanel";
import PublishQuizModal from "../components/quizzes/PublishQuizModal";
import { QuizBuilderProvider } from "../context/QuizBuilderContext";
import { useQuizBuilder } from "../context/useQuizBuilder";
import { hydrateBuilderState } from "../lib/quizBuilderReducer";
import {
  createQuiz,
  fetchQuizById,
  publishQuiz,
  updateQuizDraft,
  type PublishQuizMetadata,
  type SaveQuizPayload,
} from "../lib/quizzes";

interface QuizBuilderRouteParams {
  quizId?: string;
  [key: string]: string | undefined;
}

interface QuizBuilderFormProps {
  quizId?: string;
}

function QuizBuilderForm({ quizId }: QuizBuilderFormProps) {
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
      <QuizBuilderForm quizId={quizId} />
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
