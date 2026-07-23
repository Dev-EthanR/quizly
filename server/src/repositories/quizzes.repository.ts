import { prisma } from "../lib/prisma.js";
import type { QuizStatus } from "shared";

interface FindManyByOwnerParams {
  ownerId: string;
  status?: QuizStatus | undefined;
}

export const quizzesRepository = {
  findManyByOwner({ ownerId, status }: FindManyByOwnerParams) {
    return prisma.quiz.findMany({
      where: { ownerId, ...(status ? { status } : {}) },
      orderBy: { updatedAt: "desc" },
    });
  },
};
