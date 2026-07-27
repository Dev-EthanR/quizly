import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveQuiz, unsaveQuiz, type DiscoverQuizDetail } from "../lib/quizzes";

export function useSaveQuizMutation(quizId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nextSaved: boolean) =>
      nextSaved ? saveQuiz(quizId) : unsaveQuiz(quizId),
    onSuccess: (_data, nextSaved) => {
      queryClient.setQueryData<DiscoverQuizDetail>(
        ["discover-quiz", quizId],
        (current) => (current ? { ...current, isSaved: nextSaved } : current),
      );
    },
  });
}
