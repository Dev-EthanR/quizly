import "dotenv/config";
import type { ExpressAuthConfig } from "@auth/express";
import Google from "@auth/express/providers/google";
import { prisma } from "./lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

const secret = process.env.AUTH_SECRET;
if (!secret) {
  throw new Error("Missing AUTH_SECRET environment variable");
}

const frontendUrl = process.env.PUBLIC_FRONTEND_URL;
if (!frontendUrl) {
  throw new Error("Missing PUBLIC_FRONTEND_URL environment variable");
}

export const authConfig: ExpressAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({
      user,
    }: {
      user: {
        email?: string | null;
        name?: string | null;
        image?: string | null;
      };
    }) {
      if (!user.email) return false;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name ?? undefined,
          avatar: user.image ?? undefined,
        },
        create: {
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
          avatar: user.image,
        },
      });

      return true;
    },
    async jwt({ token }: { token: Record<string, unknown> }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) token.userId = dbUser.id;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: any;
      token: Record<string, unknown>;
    }) {
      if (session.user) session.user.id = token.userId as string;
      return session;
    },
  },
  trustHost: true,
  secret,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" as const },
};
