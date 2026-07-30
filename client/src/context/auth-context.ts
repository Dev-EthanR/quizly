import { createContext } from "react";
import type { AuthUser, CredentialsPayload, RegisterPayload } from "../entities/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

export interface AuthContextValue extends AuthState {
  signInWithGoogle: (callbackUrl?: string) => Promise<void>;
  signInWithCredentials: (
    payload: CredentialsPayload,
    callbackUrl?: string,
  ) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  signOut: (callbackUrl?: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
