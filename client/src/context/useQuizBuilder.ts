import { useRequiredContext } from "./createContextHook";
import {
  QuizBuilderContext,
  type QuizBuilderContextValue,
} from "./quiz-builder-context";

export function useQuizBuilder(): QuizBuilderContextValue {
  return useRequiredContext(QuizBuilderContext, "QuizBuilderProvider");
}
