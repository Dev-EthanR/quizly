import { getSession } from "@auth/express";
import type { Request, Response } from "express";
import { registerSchema, updateProfileSchema } from "shared";
import { authConfig } from "../auth.config.js";
import * as usersService from "../services/users.service.js";

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const result = await usersService.registerUser(parsed.data);

  if (result.status === "conflict") {
    return res
      .status(409)
      .json({ error: `That ${result.field} is already taken` });
  }

  res.status(201).json({ message: "Account created" });
}

export async function getMe(req: Request, res: Response) {
  const session = await getSession(req, authConfig);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const profile = await usersService.getMe(session.user.id);
  if (!profile) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(profile);
}

export async function updateMe(req: Request, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const session = await getSession(req, authConfig);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = await usersService.updateProfile({
    userId: session.user.id,
    input: parsed.data,
  });

  if (result.status === "conflict") {
    return res.status(409).json({ error: "That email is already taken" });
  }

  res.json(result.user);
}
