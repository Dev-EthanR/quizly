import bcrypt from "bcrypt";
import type { UpdateProfileInput } from "shared";
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

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  avatarColor: string;
  providers: string[];
}

export async function getMe(userId: string): Promise<UserProfile | null> {
  const user = await usersRepository.findById(userId);
  if (!user) return null;

  const accounts = await usersRepository.findAccountsByUserId(userId);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    avatarColor: user.avatarColor,
    providers: accounts.map((account) => account.provider),
  };
}

interface UpdateProfileParams {
  userId: string;
  input: UpdateProfileInput;
}

type UpdateProfileResult =
  | { status: "ok"; user: UserProfile }
  | { status: "conflict" };

export async function updateProfile({
  userId,
  input,
}: UpdateProfileParams): Promise<UpdateProfileResult> {
  const existing = await usersRepository.findByEmailExcludingId({
    email: input.email,
    excludeId: userId,
  });
  if (existing) {
    return { status: "conflict" };
  }

  await usersRepository.updateProfile({
    id: userId,
    name: input.name,
    email: input.email,
    avatarColor: input.avatarColor,
    image: input.image,
  });

  const user = await getMe(userId);
  return { status: "ok", user: user! };
}
