import { useQuery } from "@tanstack/react-query";
import { fetchDiscoverQuizById } from "../lib/quizzes";

export function useDiscoverQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: ["discover-quiz", quizId],
    queryFn: () => fetchDiscoverQuizById(quizId as string),
    enabled: Boolean(quizId),
    retry: false,
  });
}
