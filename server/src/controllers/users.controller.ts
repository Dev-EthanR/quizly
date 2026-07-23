import type { Request, Response } from "express";
import { registerSchema } from "shared";
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
