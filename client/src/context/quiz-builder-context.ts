import { createContext, type Dispatch } from "react";
import type {
  QuizAnswerDraft,
  QuizDraft,
  QuizQuestionDraft,
} from "../lib/quizzes";

export type QuizBuilderState = QuizDraft;

export type QuizBuilderAction =
  | { type: "SET_TITLE"; title: string }
  | { type: "ADD_QUESTION"; question: QuizQuestionDraft }
  | { type: "REMOVE_QUESTION"; questionId: string }
  | { type: "REPLACE_QUESTION"; question: QuizQuestionDraft }
  | { type: "SET_QUESTION_PROMPT"; questionId: string; prompt: string }
  | {
      type: "SET_QUESTION_TIME_LIMIT";
      questionId: string;
      timeLimitSeconds: number;
    }
  | { type: "SET_QUESTION_POINTS"; questionId: string; points: number }
  | { type: "ADD_ANSWER"; questionId: string }
  | { type: "REMOVE_ANSWER"; questionId: string; answerId: string }
  | {
      type: "SET_ANSWER_TEXT";
      questionId: string;
      answerId: string;
      text: string;
    }
  | { type: "TOGGLE_CORRECT_ANSWER"; questionId: string; answerId: string }
  | { type: "APPLY_GENERATED_QUESTIONS"; questions: QuizQuestionDraft[] }
  | {
      type: "APPLY_GENERATED_ANSWERS";
      questionId: string;
      answers: QuizAnswerDraft[];
      correctAnswerIds: string[];
    };

export interface QuizBuilderContextValue {
  state: QuizBuilderState;
  dispatch: Dispatch<QuizBuilderAction>;
}

export const QuizBuilderContext = createContext<
  QuizBuilderContextValue | undefined
>(undefined);
