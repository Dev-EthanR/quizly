import { getSession } from "@auth/express";
import type { Request, Response } from "express";
import {
  discoverQuizzesQuerySchema,
  listQuizzesQuerySchema,
  publishQuizSchema,
  quizCategoryLabels,
  quizCategorySchema,
  saveQuizDraftSchema,
} from "shared";
import { authConfig } from "../auth.config.js";
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
    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await quizzesService.saveQuiz({
      id: req.params.id as string,
      userId: session.user.id,
    });

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.status(204).send();
  },

  async unsaveQuiz(req: Request, res: Response) {
    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await quizzesService.unsaveQuiz({
      id: req.params.id as string,
      userId: session.user.id,
    });

    res.status(204).send();
  },

  async listMyQuizzes(req: Request, res: Response) {
    const parsed = listQuizzesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const quizzes = await quizzesService.listMyQuizzes({
      ownerId: session.user.id,
      status: parsed.data.status,
    });

    res.json(quizzes);
  },

  async createQuiz(req: Request, res: Response) {
    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.body?.status === "published") {
      const parsed = publishQuizSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const quiz = await quizzesService.createPublishedQuiz({
        ownerId: session.user.id,
        input: parsed.data,
      });

      return res.status(201).json(quiz);
    }

    const parsed = saveQuizDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const quiz = await quizzesService.createQuiz({
      ownerId: session.user.id,
      draft: parsed.data,
    });

    res.status(201).json(quiz);
  },

  async getQuiz(req: Request, res: Response) {
    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await quizzesService.getQuizForOwner({
      id: req.params.id as string,
      ownerId: session.user.id,
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
    const parsed = saveQuizDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await quizzesService.updateQuizDraft({
      id: req.params.id as string,
      ownerId: session.user.id,
      draft: parsed.data,
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
    const parsed = publishQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await quizzesService.publishQuiz({
      id: req.params.id as string,
      ownerId: session.user.id,
      input: parsed.data,
    });

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (result.status === "forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(result.quiz);
  },
};
