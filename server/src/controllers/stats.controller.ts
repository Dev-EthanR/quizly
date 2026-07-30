import { getSession } from "@auth/express";
import type { Request, Response } from "express";
import { listGamesQuerySchema } from "shared";
import { authConfig } from "../auth.config.js";
import { statsService } from "../services/stats.service.js";

export const statsController = {
  async getDashboardStats(req: Request, res: Response) {
    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const stats = await statsService.getDashboardStats(session.user.id);
    res.json(stats);
  },

  async listRecentGames(req: Request, res: Response) {
    const parsed = listGamesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await statsService.listRecentGames(
      session.user.id,
      parsed.data.page,
    );
    res.json(result);
  },

  async listHostedSessions(req: Request, res: Response) {
    const parsed = listGamesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await statsService.listHostedSessions(
      session.user.id,
      parsed.data.page,
    );
    res.json(result);
  },

  async getHostedSessionDetail(req: Request, res: Response) {
    const session = await getSession(req, authConfig);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const detail = await statsService.getHostedSessionDetail(
      session.user.id,
      req.params.sessionId as string,
    );
    if (!detail) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(detail);
  },
};
