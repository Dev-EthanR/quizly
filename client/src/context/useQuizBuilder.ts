import { useContext } from "react";
import {
  QuizBuilderContext,
  type QuizBuilderContextValue,
} from "./quiz-builder-context";

export function useQuizBuilder(): QuizBuilderContextValue {
  const context = useContext(QuizBuilderContext);
  if (!context) {
    throw new Error("useQuizBuilder must be used within a QuizBuilderProvider");
  }
  return context;
}
