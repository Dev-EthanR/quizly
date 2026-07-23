import "dotenv/config";
import type { ExpressAuthConfig } from "@auth/express";
import Google from "@auth/express/providers/google";
import { prisma } from "./lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "@auth/express/providers/credentials";
import bcrypt from "bcrypt";
import type { User } from "./generated/prisma/browser";

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
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) session.user.id = token.userId;
      return session;
    },
    async redirect({ url }: { url: string }) {
      if (url.startsWith("/")) return `${frontendUrl}${url}`;
      if (new URL(url).origin === frontendUrl) return url;
      return frontendUrl;
    },
  },
  trustHost: true,
  secret,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  basePath: "/api/auth",
};
