import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GENERATE_QUIZ_QUESTION_COUNT_BOUNDS } from "shared";
import { extractApiErrorMessage } from "../lib/apiError";
import { generateQuizFromTitle } from "../lib/quizzes";
import type { QuizQuestionDraft } from "../entities/quiz";

const MAX_GENERATION_ATTEMPTS = 2;
const DEFAULT_QUESTION_COUNT = 5;

export interface UseGenerateQuizResult {
  questionCount: number;
  setQuestionCount: (count: number) => void;
  allowTrueFalse: boolean;
  setAllowTrueFalse: (value: boolean) => void;
  allowMultipleAnswers: boolean;
  setAllowMultipleAnswers: (value: boolean) => void;
  suggestions: QuizQuestionDraft[] | null;
  includedIds: Set<string>;
  toggleIncluded: (questionId: string) => void;
  isGenerating: boolean;
  errorMessage: string | null;
  canGenerate: boolean;
  canRegenerate: boolean;
  attemptsUsed: number;
  generate: () => void;
  reset: () => void;
}

export function useGenerateQuiz(title: string): UseGenerateQuizResult {
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [allowTrueFalse, setAllowTrueFalse] = useState(false);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [suggestions, setSuggestions] = useState<QuizQuestionDraft[] | null>(null);
  const [includedIds, setIncludedIds] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);

  const mutation = useMutation({
    mutationFn: () =>
      generateQuizFromTitle({
        title,
        questionCount,
        allowTrueFalse,
        allowMultipleAnswers,
      }),
    onSuccess: (result) => {
      setSuggestions(result.questions);
      setIncludedIds(new Set(result.questions.map((question) => question.id)));
      setAttempts((count) => count + 1);
    },
  });

  const toggleIncluded = (questionId: string) => {
    setIncludedIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const clampedQuestionCount = Math.min(
    Math.max(questionCount, GENERATE_QUIZ_QUESTION_COUNT_BOUNDS.min),
    GENERATE_QUIZ_QUESTION_COUNT_BOUNDS.max,
  );

  return {
    questionCount,
    setQuestionCount,
    allowTrueFalse,
    setAllowTrueFalse,
    allowMultipleAnswers,
    setAllowMultipleAnswers,
    suggestions,
    includedIds,
    toggleIncluded,
    isGenerating: mutation.isPending,
    errorMessage: mutation.isError
      ? extractApiErrorMessage(mutation.error, "Couldn't generate questions. Try again.")
      : null,
    canGenerate: title.trim().length >= 3 && attempts < MAX_GENERATION_ATTEMPTS,
    canRegenerate: attempts > 0 && attempts < MAX_GENERATION_ATTEMPTS,
    attemptsUsed: attempts,
    generate: () => {
      setQuestionCount(clampedQuestionCount);
      mutation.mutate();
    },
    reset: () => {
      setSuggestions(null);
      setIncludedIds(new Set());
      setAttempts(0);
      mutation.reset();
    },
  };
}
