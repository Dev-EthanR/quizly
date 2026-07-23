import { prisma } from "../lib/prisma.js";

interface FindByEmailOrNameParams {
  email: string;
  name: string;
}

export function findByEmailOrName({ email, name }: FindByEmailOrNameParams) {
  return prisma.user.findFirst({ where: { OR: [{ email }, { name }] } });
}

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}

export function create({ name, email, password }: CreateUserParams) {
  return prisma.user.create({ data: { name, email, password } });
}
