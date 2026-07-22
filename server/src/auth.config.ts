import "dotenv/config";
import type { ExpressAuthConfig } from "@auth/express";
import Google from "@auth/express/providers/google";

const secret = process.env.AUTH_SECRET;
if (!secret) {
  throw new Error("Missing AUTH_SECRET environment variable");
}

const frontendUrl = process.env.PUBLIC_FRONTEND_URL;
if (!frontendUrl) {
  throw new Error("Missing PUBLIC_FRONTEND_URL environment variable");
}

export const authConfig: ExpressAuthConfig = {
  providers: [Google],
  trustHost: true,
  secret,
};
