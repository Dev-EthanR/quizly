import { quizzesRepository } from "../repositories/quizzes.repository.js";
import type { QuizStatus } from "shared";

interface ListMyQuizzesParams {
  ownerId: string;
  status?: QuizStatus | undefined;
}

export function listMyQuizzes({ ownerId, status }: ListMyQuizzesParams) {
  return quizzesRepository.findManyByOwner({ ownerId, status });
}
