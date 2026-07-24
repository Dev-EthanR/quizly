import { useQuery } from "@tanstack/react-query";
import { fetchQuizCategories } from "../lib/quizzes";

export function useQuizCategories() {
  return useQuery({
    queryKey: ["quiz-categories"],
    queryFn: fetchQuizCategories,
  });
}
