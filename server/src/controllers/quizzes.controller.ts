import { getSession } from "@auth/express";
import type { Request, Response } from "express";
import {
  discoverQuizzesQuerySchema,
  listQuizzesQuerySchema,
  publishQuizSchema,
  quizCategoryLabels,
  quizCategorySchema,
  saveQuizDraftSchema,
  type GenerateAnswersInput,
  type GenerateQuizInput,
  type PublishQuizInput,
  type SaveQuizDraftInput,
} from "shared";
import { authConfig } from "../auth.config.js";
import { aiService } from "../services/ai.service.js";
import { quizzesService } from "../services/quizzes.service.js";

export const quizzesController = {
  listCategories(req: Request, res: Response) {
    const categories = quizCategorySchema.options.map((id) => ({
      id,
      name: quizCategoryLabels[id],
    }));
    res.json(categories);
  },

  async discoverQuizzes(req: Request, res: Response) {
    const parsed = discoverQuizzesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const result = await quizzesService.discoverQuizzes(parsed.data);
    res.json(result);
  },

  async getDiscoverQuizById(req: Request, res: Response) {
    const session = await getSession(req, authConfig);
    const result = await quizzesService.getPublicQuizById({
      id: req.params.id as string,
      userId: session?.user?.id,
    });

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(result.quiz);
  },

  async saveQuiz(req: Request, res: Response) {
    const result = await quizzesService.saveQuiz({
      id: req.params.id as string,
      userId: req.userId,
    });

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.status(204).send();
  },

  async unsaveQuiz(req: Request, res: Response) {
    await quizzesService.unsaveQuiz({
      id: req.params.id as string,
      userId: req.userId,
    });

    res.status(204).send();
  },

  async listSavedQuizzes(req: Request, res: Response) {
    const quizzes = await quizzesService.listSavedQuizzes(req.userId);
    res.json(quizzes);
  },

  async listMyQuizzes(req: Request, res: Response) {
    const parsed = listQuizzesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const quizzes = await quizzesService.listMyQuizzes({
      ownerId: req.userId,
      status: parsed.data.status,
    });

    res.json(quizzes);
  },

  async createQuiz(req: Request, res: Response) {
    if (req.body?.status === "published") {
      const parsed = publishQuizSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const quiz = await quizzesService.createPublishedQuiz({
        ownerId: req.userId,
        input: parsed.data,
      });

      return res.status(201).json(quiz);
    }

    const parsed = saveQuizDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const quiz = await quizzesService.createQuiz({
      ownerId: req.userId,
      draft: parsed.data,
    });

    res.status(201).json(quiz);
  },

  async getQuiz(req: Request, res: Response) {
    const result = await quizzesService.getQuizForOwner({
      id: req.params.id as string,
      ownerId: req.userId,
    });

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (result.status === "forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(result.quiz);
  },

  async updateQuizDraft(req: Request, res: Response) {
    const draft = req.body as SaveQuizDraftInput;

    const result = await quizzesService.updateQuizDraft({
      id: req.params.id as string,
      ownerId: req.userId,
      draft,
    });

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (result.status === "forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(result.quiz);
  },

  async publishQuiz(req: Request, res: Response) {
    const input = req.body as PublishQuizInput;

    const result = await quizzesService.publishQuiz({
      id: req.params.id as string,
      ownerId: req.userId,
      input,
    });

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (result.status === "forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(result.quiz);
  },

  async deleteQuiz(req: Request, res: Response) {
    const result = await quizzesService.deleteQuiz({
      id: req.params.id as string,
      ownerId: req.userId,
    });

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (result.status === "forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.status(204).send();
  },

  async generateQuiz(req: Request, res: Response) {
    const { title, questionCount, allowTrueFalse, allowMultipleAnswers, excludeQuestionPrompts } =
      req.body as GenerateQuizInput;

    const result = await aiService.generateQuiz({
      title,
      questionCount,
      allowTrueFalse,
      allowMultipleAnswers,
      excludeQuestionPrompts,
    });
    res.json(result);
  },

  async generateAnswers(req: Request, res: Response) {
    const { quizTitle, prompt, answerCount } = req.body as GenerateAnswersInput;

    const result = await aiService.generateAnswers({ quizTitle, prompt, answerCount });
    res.json(result);
  },
};
