import { quizzesRepository } from "../repositories/quizzes.repository.js";
import {
  DISCOVER_QUIZZES_PAGE_SIZE,
  type PublishQuizInput,
  type QuizCategory,
  type QuizDifficulty,
  type QuizStatus,
  type SaveQuizDraftInput,
} from "shared";

interface ListMyQuizzesParams {
  ownerId: string;
  status?: QuizStatus | undefined;
}

interface DiscoverQuizzesParams {
  search?: string | undefined;
  category?: QuizCategory | undefined;
  difficulty?: QuizDifficulty | undefined;
  page: number;
}

interface DraftAnswerInput {
  id: string;
  text: string;
}

interface DraftQuestionInput {
  id: string;
  prompt: string;
  answers: DraftAnswerInput[];
  correctAnswerIds: string[];
  timeLimitSeconds: number;
  points: number;
}

function toQuestionInputs(questions: DraftQuestionInput[]) {
  return questions.map((question, questionIndex) => ({
    id: question.id,
    prompt: question.prompt,
    order: questionIndex,
    timeLimitSeconds: question.timeLimitSeconds,
    points: question.points,
    answers: question.answers.map((answer, answerIndex) => ({
      id: answer.id,
      text: answer.text,
      isCorrect: question.correctAnswerIds.includes(answer.id),
      order: answerIndex,
    })),
  }));
}

interface CreateQuizParams {
  ownerId: string;
  draft: SaveQuizDraftInput;
}

interface CreatePublishedQuizParams {
  ownerId: string;
  input: PublishQuizInput;
}

type QuizMutationResult<T> =
  | { status: "ok"; quiz: T }
  | { status: "not_found" }
  | { status: "forbidden" };

interface UpdateQuizDraftParams {
  id: string;
  ownerId: string;
  draft: SaveQuizDraftInput;
}

interface PublishQuizParams {
  id: string;
  ownerId: string;
  input: PublishQuizInput;
}

interface GetQuizForOwnerParams {
  id: string;
  ownerId: string;
}

interface GetPublicQuizByIdParams {
  id: string;
  userId?: string | undefined;
}

interface SaveQuizParams {
  id: string;
  userId: string;
}

export const quizzesService = {
  listMyQuizzes({ ownerId, status }: ListMyQuizzesParams) {
    return quizzesRepository.findManyByOwner({ ownerId, status });
  },

  async discoverQuizzes({ search, category, difficulty, page }: DiscoverQuizzesParams) {
    const { quizzes, totalCount } = await quizzesRepository.findPublished({
      search,
      category,
      difficulty,
      page,
    });

    return {
      quizzes: quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        coverImage: quiz.coverImage,
        category: quiz.category,
        difficulty: quiz.difficulty,
        tags: quiz.tags,
        questionCount: quiz.questionCount,
        playCount: quiz.playCount,
        ownerName: quiz.owner.name,
        ownerImage: quiz.owner.image,
      })),
      page,
      totalPages: Math.max(1, Math.ceil(totalCount / DISCOVER_QUIZZES_PAGE_SIZE)),
      totalCount,
    };
  },

  async getPublicQuizById({ id, userId }: GetPublicQuizByIdParams) {
    const quiz = await quizzesRepository.findPublishedById(id);
    if (!quiz) {
      return { status: "not_found" as const };
    }

    const isSaved = userId
      ? Boolean(await quizzesRepository.findSavedQuiz({ userId, quizId: id }))
      : false;

    return {
      status: "ok" as const,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        coverImage: quiz.coverImage,
        category: quiz.category,
        difficulty: quiz.difficulty,
        tags: quiz.tags,
        questionCount: quiz.questionCount,
        playCount: quiz.playCount,
        ownerName: quiz.owner.name,
        ownerImage: quiz.owner.image,
        isSaved,
        questions: quiz.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          timeLimitSeconds: question.timeLimitSeconds,
          points: question.points,
        })),
      },
    };
  },

  async saveQuiz({ id, userId }: SaveQuizParams) {
    const quiz = await quizzesRepository.findPublishedById(id);
    if (!quiz) {
      return { status: "not_found" as const };
    }

    await quizzesRepository.saveQuiz({ userId, quizId: id });
    return { status: "ok" as const };
  },

  async unsaveQuiz({ id, userId }: SaveQuizParams) {
    await quizzesRepository.unsaveQuiz({ userId, quizId: id });
    return { status: "ok" as const };
  },

  async listSavedQuizzes(userId: string) {
    const savedQuizzes = await quizzesRepository.findSavedByUser(userId);

    return savedQuizzes.map(({ quiz }) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      coverImage: quiz.coverImage,
      category: quiz.category,
      difficulty: quiz.difficulty,
      tags: quiz.tags,
      questionCount: quiz.questionCount,
      playCount: quiz.playCount,
      ownerName: quiz.owner.name,
      ownerImage: quiz.owner.image,
    }));
  },

  createQuiz({ ownerId, draft }: CreateQuizParams) {
    return quizzesRepository.create({
      ownerId,
      title: draft.title,
      questions: toQuestionInputs(draft.questions),
    });
  },

  createPublishedQuiz({ ownerId, input }: CreatePublishedQuizParams) {
    return quizzesRepository.createPublished({
      ownerId,
      title: input.title,
      category: input.category,
      difficulty: input.difficulty,
      tags: input.tags,
      visibility: input.visibility,
      coverImage: input.coverImage,
      description: input.description,
      questions: toQuestionInputs(input.questions),
    });
  },

  async getQuizForOwner({
    id,
    ownerId,
  }: GetQuizForOwnerParams): Promise<
    QuizMutationResult<NonNullable<Awaited<ReturnType<typeof quizzesRepository.findById>>>>
  > {
    const quiz = await quizzesRepository.findById(id);
    if (!quiz) {
      return { status: "not_found" };
    }
    if (quiz.ownerId !== ownerId) {
      return { status: "forbidden" };
    }

    return { status: "ok", quiz };
  },

  async updateQuizDraft({
    id,
    ownerId,
    draft,
  }: UpdateQuizDraftParams): Promise<
    QuizMutationResult<NonNullable<Awaited<ReturnType<typeof quizzesRepository.replaceQuestions>>>>
  > {
    const existing = await quizzesRepository.findById(id);
    if (!existing) {
      return { status: "not_found" };
    }
    if (existing.ownerId !== ownerId) {
      return { status: "forbidden" };
    }

    const quiz = await quizzesRepository.replaceQuestions({
      id,
      title: draft.title,
      questions: toQuestionInputs(draft.questions),
    });

    return { status: "ok", quiz: quiz! };
  },

  async publishQuiz({
    id,
    ownerId,
    input,
  }: PublishQuizParams): Promise<
    QuizMutationResult<Awaited<ReturnType<typeof quizzesRepository.publish>>>
  > {
    const existing = await quizzesRepository.findById(id);
    if (!existing) {
      return { status: "not_found" };
    }
    if (existing.ownerId !== ownerId) {
      return { status: "forbidden" };
    }

    await quizzesRepository.replaceQuestions({
      id,
      title: input.title,
      questions: toQuestionInputs(input.questions),
    });

    const quiz = await quizzesRepository.publish({
      id,
      category: input.category,
      difficulty: input.difficulty,
      tags: input.tags,
      visibility: input.visibility,
      coverImage: input.coverImage,
      description: input.description,
    });

    return { status: "ok", quiz };
  },
};
