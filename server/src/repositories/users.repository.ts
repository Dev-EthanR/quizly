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

interface FindByEmailExcludingIdParams {
  email: string;
  excludeId: string;
}

interface UpdateProfileParams {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  image?: string | null | undefined;
}

export const usersRepository = {
  findByEmailOrName({ email, name }: FindByEmailOrNameParams) {
    return prisma.user.findFirst({ where: { OR: [{ email }, { name }] } });
  },

  create({ name, email, password }: CreateUserParams) {
    return prisma.user.create({ data: { name, email, password } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmailExcludingId({ email, excludeId }: FindByEmailExcludingIdParams) {
    return prisma.user.findFirst({
      where: { email, NOT: { id: excludeId } },
    });
  },

  findAccountsByUserId(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      select: { provider: true },
    });
  },

  updateProfile({ id, name, email, avatarColor, image }: UpdateProfileParams) {
    return prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        avatarColor,
        ...(image !== undefined ? { image } : {}),
      },
    });
  },
};
