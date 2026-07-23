import bcrypt from "bcrypt";
import { usersRepository } from "../repositories/users.repository.js";

interface RegisterUserParams {
  name: string;
  email: string;
  password: string;
}

type RegisterUserResult =
  | { status: "created" }
  | { status: "conflict"; field: "email" | "username" };

export async function registerUser({
  name,
  email,
  password,
}: RegisterUserParams): Promise<RegisterUserResult> {
  const existing = await usersRepository.findByEmailOrName({ email, name });
  if (existing) {
    return {
      status: "conflict",
      field: existing.email === email ? "email" : "username",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await usersRepository.create({ name, email, password: hashedPassword });

  return { status: "created" };
}
