import { getSession } from "@auth/express";
import type { NextFunction, Request, Response } from "express";
import { authConfig } from "./auth.config";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = res.locals.session ?? (await getSession(req, authConfig));
  if (session?.user) {
    return next();
  } else {
    res.redirect("/");
  }
}
