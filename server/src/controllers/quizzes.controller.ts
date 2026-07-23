import { getSession } from "@auth/express";
import type { Request, Response } from "express";
import { listQuizzesQuerySchema } from "shared";
import { authConfig } from "../auth.config.js";
import * as quizzesService from "../services/quizzes.service.js";

export async function listMyQuizzes(req: Request, res: Response) {
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
}
