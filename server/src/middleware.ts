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
