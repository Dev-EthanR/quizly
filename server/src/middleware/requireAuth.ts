import { getSession } from "@auth/express";
import type { NextFunction, Request, Response } from "express";
import { authConfig } from "../auth.config.js";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = await getSession(req, authConfig);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.userId = session.user.id;
  next();
}
