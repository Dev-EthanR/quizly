import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

const router = Router();

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1).max(20),
});

router.post("/register", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { name }] },
  });
  if (existing) {
    const field = existing.email === email ? "email" : "username";
    return res.status(409).json({ error: `That ${field} is already taken` });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, name, password: hashed },
  });

  res.status(201).json({ message: "Account created" });
});

export default router;
