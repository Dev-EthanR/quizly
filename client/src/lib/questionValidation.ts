import { quizQuestionSchema } from "shared";
import type { QuizQuestionDraft } from "./quizzes";

export interface QuestionValidationErrors {
  prompt?: string;
  correctAnswerIds?: string;
  answerErrors: Record<string, string>;
}

export function getQuestionErrors(
  question: QuizQuestionDraft,
): QuestionValidationErrors | null {
  const result = quizQuestionSchema.safeParse(question);
  if (result.success) return null;

  const errors: QuestionValidationErrors = { answerErrors: {} };
  for (const issue of result.error.issues) {
    const [field, index, subfield] = issue.path;
    if (field === "prompt") {
      errors.prompt = issue.message;
    } else if (field === "correctAnswerIds") {
      errors.correctAnswerIds = issue.message;
    } else if (
      field === "answers" &&
      typeof index === "number" &&
      subfield === "text"
    ) {
      const answer = question.answers[index];
      if (answer) errors.answerErrors[answer.id] = issue.message;
    }
  }
  return errors;
}

export function isQuestionValid(question: QuizQuestionDraft): boolean {
  return quizQuestionSchema.safeParse(question).success;
}
