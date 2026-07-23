import { getSession } from "@auth/express";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { authConfig } from "./auth.config";

export function asyncHandler(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

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
