import { Router } from "express";
import { registerSchema } from "shared";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

const router = Router();

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
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
