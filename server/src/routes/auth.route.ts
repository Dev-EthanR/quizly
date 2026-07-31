import { ExpressAuth } from "@auth/express";
import { authConfig } from "../auth.config.js";

export const authHandler = ExpressAuth(authConfig);
