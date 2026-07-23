import { prisma } from "../lib/prisma.js";

interface FindByEmailOrNameParams {
  email: string;
  name: string;
}

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}

export const usersRepository = {
  findByEmailOrName({ email, name }: FindByEmailOrNameParams) {
    return prisma.user.findFirst({ where: { OR: [{ email }, { name }] } });
  },

  create({ name, email, password }: CreateUserParams) {
    return prisma.user.create({ data: { name, email, password } });
  },
};
