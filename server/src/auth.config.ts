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
    async session({ session, user }: { session: any; user: { id: string } }) {
      if (session.user) session.user.id = user.id;
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
  session: { strategy: "database" as const },
  basePath: "/api/auth",
};
