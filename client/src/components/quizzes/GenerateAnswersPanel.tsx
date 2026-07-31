import { useState } from "react";
import clsx from "clsx";
import { useMutation } from "@tanstack/react-query";
import { extractApiErrorMessage } from "../../lib/apiError";
import { generateAnswersForQuestion, type GeneratedAnswers } from "../../lib/quizzes";
import { useQuizBuilder } from "../../context/useQuizBuilder";
import AiBadgeButton from "../ui/AiBadgeButton";
import type { QuizQuestionDraft } from "../../entities/quiz";

const MAX_GENERATION_ATTEMPTS = 2;

interface GenerateAnswersPanelProps {
  quizTitle: string;
  question: QuizQuestionDraft;
  attempts: number;
  onGenerated: () => void;
}

function GenerateAnswersPanel({
  quizTitle,
  question,
  attempts,
  onGenerated,
}: GenerateAnswersPanelProps) {
  const { dispatch } = useQuizBuilder();
  const [suggestion, setSuggestion] = useState<GeneratedAnswers | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      generateAnswersForQuestion({
        quizTitle,
        prompt: question.prompt,
        answerCount: question.answers.length,
      }),
    onSuccess: (result) => {
      setSuggestion(result);
      onGenerated();
    },
  });

  const canGenerate =
    question.prompt.trim().length > 0 && attempts < MAX_GENERATION_ATTEMPTS;
  const label = attempts === 0 ? "Generate answers with AI" : "Regenerate answers with AI";

  const handleApply = () => {
    if (!suggestion) return;
    dispatch({
      type: "APPLY_GENERATED_ANSWERS",
      questionId: question.id,
      answers: suggestion.answers,
      correctAnswerIds: suggestion.correctAnswerIds,
    });
    setSuggestion(null);
  };

  const handleDiscard = () => {
    setSuggestion(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {!suggestion && (
        <AiBadgeButton
          disabled={!canGenerate || mutation.isPending}
          onClick={() => mutation.mutate()}
          title={
            question.prompt.trim().length === 0
              ? "Type a question first"
              : attempts >= MAX_GENERATION_ATTEMPTS
                ? "You've used your AI generations for this question"
                : undefined
          }
        >
          {mutation.isPending ? "Generating..." : label}
        </AiBadgeButton>
      )}

      {mutation.isError && (
        <p className="text-sm text-danger">
          {extractApiErrorMessage(mutation.error, "Couldn't generate answers. Try again.")}
        </p>
      )}

      {suggestion && (
        <div className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary">AI suggested answers</p>
          <div className="flex flex-col gap-1.5">
            {suggestion.answers.map((answer) => (
              <span
                key={answer.id}
                className={clsx(
                  "rounded-lg border px-3 py-1.5 text-sm",
                  suggestion.correctAnswerIds.includes(answer.id)
                    ? "border-secondary text-secondary"
                    : "border-border text-muted",
                )}
              >
                {answer.text}
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleApply}
              className="cursor-pointer text-sm font-semibold text-primary hover:underline"
            >
              Use these answers
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="cursor-pointer text-sm font-semibold text-muted hover:text-foreground"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerateAnswersPanel;
