import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { publishQuizContentSchema, publishQuizSchema, saveQuizDraftSchema } from "shared";
import { useQuizBuilder } from "../context/useQuizBuilder";
import { isPublishMetadataValid, type PublishMetadataDraft } from "../lib/publishValidation";
import {
  createQuiz,
  publishQuiz,
  updateQuizDraft,
  type PublishQuizMetadata,
  type QuizCategory,
  type QuizDifficulty,
  type QuizVisibility,
  type SaveQuizPayload,
} from "../lib/quizzes";

interface UseQuizBuilderSaveParams {
  quizId?: string;
  metadataDraft: PublishMetadataDraft;
  category: QuizCategory | "";
  difficulty: QuizDifficulty | null;
  tags: string[];
  visibility: QuizVisibility;
  coverImage?: string;
}

export interface UseQuizBuilderSaveResult {
  validationErrors: string[];
  isPublishModalOpen: boolean;
  closePublishModal: () => void;
  hasAttemptedSaveChanges: boolean;
  isSaving: boolean;
  isSaveError: boolean;
  handleSaveDraft: () => void;
  handleSaveChanges: () => void;
  handleOpenPublishModal: () => void;
  handleConfirmPublish: (metadata: PublishQuizMetadata) => void;
}

export function useQuizBuilderSave({
  quizId,
  metadataDraft,
  category,
  difficulty,
  tags,
  visibility,
  coverImage,
}: UseQuizBuilderSaveParams): UseQuizBuilderSaveResult {
  const { state } = useQuizBuilder();
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [hasAttemptedSaveChanges, setHasAttemptedSaveChanges] = useState(false);

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
      tags,
      visibility,
      coverImage,
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

  return {
    validationErrors,
    isPublishModalOpen,
    closePublishModal: () => setIsPublishModalOpen(false),
    hasAttemptedSaveChanges,
    isSaving: saveMutation.isPending,
    isSaveError: saveMutation.isError,
    handleSaveDraft,
    handleSaveChanges,
    handleOpenPublishModal,
    handleConfirmPublish,
  };
}
