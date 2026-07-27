import { prisma } from "../lib/prisma.js";
import type {
  QuizCategory,
  QuizDifficulty,
  QuizStatus,
  QuizVisibility,
} from "shared";

interface FindManyByOwnerParams {
  ownerId: string;
  status?: QuizStatus | undefined;
}

interface AnswerInput {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface QuestionInput {
  id: string;
  prompt: string;
  order: number;
  timeLimitSeconds: number;
  points: number;
  answers: AnswerInput[];
}

interface CreateQuizParams {
  ownerId: string;
  title: string;
  questions: QuestionInput[];
}

interface CreatePublishedQuizParams {
  ownerId: string;
  title: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  tags: string[];
  visibility: QuizVisibility;
  coverImage?: string | undefined;
  questions: QuestionInput[];
}

interface ReplaceQuestionsParams {
  id: string;
  title: string;
  questions: QuestionInput[];
}

interface PublishParams {
  id: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  tags: string[];
  visibility: QuizVisibility;
  coverImage?: string | undefined;
}

const quizWithQuestionsInclude = {
  questions: {
    orderBy: { order: "asc" as const },
    include: {
      answers: {
        orderBy: { order: "asc" as const },
      },
    },
  },
};

function toQuestionCreateInputs(questions: QuestionInput[]) {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    order: question.order,
    timeLimitSeconds: question.timeLimitSeconds,
    points: question.points,
    answers: {
      create: question.answers.map((answer) => ({
        id: answer.id,
        text: answer.text,
        isCorrect: answer.isCorrect,
        order: answer.order,
      })),
    },
  }));
}

export const quizzesRepository = {
  findManyByOwner({ ownerId, status }: FindManyByOwnerParams) {
    return prisma.quiz.findMany({
      where: { ownerId, ...(status ? { status } : {}) },
      orderBy: { updatedAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.quiz.findUnique({
      where: { id },
      include: quizWithQuestionsInclude,
    });
  },

  create({ ownerId, title, questions }: CreateQuizParams) {
    return prisma.quiz.create({
      data: {
        ownerId,
        title,
        questionCount: questions.length,
        questions: {
          create: toQuestionCreateInputs(questions),
        },
      },
      include: quizWithQuestionsInclude,
    });
  },

  createPublished({
    ownerId,
    title,
    category,
    difficulty,
    tags,
    visibility,
    coverImage,
    questions,
  }: CreatePublishedQuizParams) {
    return prisma.quiz.create({
      data: {
        ownerId,
        title,
        status: "published",
        category,
        difficulty,
        tags,
        visibility,
        questionCount: questions.length,
        ...(coverImage !== undefined ? { coverImage } : {}),
        questions: {
          create: toQuestionCreateInputs(questions),
        },
      },
      include: quizWithQuestionsInclude,
    });
  },

  async replaceQuestions({ id, title, questions }: ReplaceQuestionsParams) {
    await prisma.$transaction([
      prisma.question.deleteMany({ where: { quizId: id } }),
      prisma.quiz.update({
        where: { id },
        data: {
          title,
          questionCount: questions.length,
          questions: {
            create: toQuestionCreateInputs(questions),
          },
        },
      }),
    ]);

    return quizzesRepository.findById(id);
  },

  publish({ id, category, difficulty, tags, visibility, coverImage }: PublishParams) {
    return prisma.quiz.update({
      where: { id },
      data: {
        status: "published",
        category,
        difficulty,
        tags,
        visibility,
        ...(coverImage !== undefined ? { coverImage } : {}),
      },
      include: quizWithQuestionsInclude,
    });
  },
};
