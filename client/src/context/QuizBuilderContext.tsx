import { useReducer, type ReactNode } from "react";
import { createEmptyDraft, quizBuilderReducer } from "../lib/quizBuilderReducer";
import { QuizBuilderContext, type QuizBuilderState } from "./quiz-builder-context";

interface QuizBuilderProviderProps {
  children: ReactNode;
  initialState?: QuizBuilderState;
}

export function QuizBuilderProvider({
  children,
  initialState,
}: QuizBuilderProviderProps) {
  const [state, dispatch] = useReducer(
    quizBuilderReducer,
    initialState ?? createEmptyDraft(),
  );

  return (
    <QuizBuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizBuilderContext.Provider>
  );
}
