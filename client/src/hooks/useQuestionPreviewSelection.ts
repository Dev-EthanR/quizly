import { useState } from "react";
import type { QuizQuestionDraft } from "../entities/quiz";

export interface UseQuestionPreviewSelectionResult {
  resolvedSelectedId: string | null;
  previewIndex: number;
  previewQuestion: QuizQuestionDraft | null;
  setSelectedQuestionId: (id: string | null) => void;
  handleQuestionRemoved: (questionId: string) => void;
}

export function useQuestionPreviewSelection(
  questions: QuizQuestionDraft[],
): UseQuestionPreviewSelectionResult {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const resolvedSelectedId = selectedQuestionId ?? questions[0]?.id ?? null;
  const previewIndex = questions.findIndex(
    (question) => question.id === resolvedSelectedId,
  );
  const previewQuestion = previewIndex >= 0 ? questions[previewIndex] : null;

  const handleQuestionRemoved = (questionId: string) => {
    if (selectedQuestionId === questionId) setSelectedQuestionId(null);
  };

  return {
    resolvedSelectedId,
    previewIndex,
    previewQuestion,
    setSelectedQuestionId,
    handleQuestionRemoved,
  };
}
