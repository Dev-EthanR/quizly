import { useCallback, useEffect, useReducer, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSession,
  registerUser,
  signInWithCredentials,
  signInWithGoogle,
  signOutUser,
} from "../lib/auth";
import type { CredentialsPayload, RegisterPayload } from "../entities/auth";
import {
  AuthContext,
  type AuthContextValue,
  type AuthState,
} from "./auth-context";

type AuthAction = { type: "SESSION_LOADING" } | {
  type: "SESSION_RESOLVED";
  user: AuthState["user"];
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SESSION_LOADING":
      return { ...state, status: "loading" };
    case "SESSION_RESOLVED":
      return {
        status: action.user ? "authenticated" : "unauthenticated",
        user: action.user,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(authReducer, {
    status: "loading",
    user: null,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isLoading) {
      dispatch({ type: "SESSION_LOADING" });
      return;
    }
    dispatch({ type: "SESSION_RESOLVED", user: data?.user ?? null });
  }, [data, isLoading]);

  const handleSignInWithGoogle = useCallback(
    async (callbackUrl: string = window.location.origin) => {
      await signInWithGoogle(callbackUrl);
    },
    [],
  );

  const handleSignInWithCredentials = useCallback(
    async (
      payload: CredentialsPayload,
      callbackUrl: string = window.location.origin,
    ) => {
      await signInWithCredentials(payload, callbackUrl);
      await queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    [queryClient],
  );

  const handleRegister = useCallback(async (payload: RegisterPayload) => {
    await registerUser(payload);
  }, []);

  const handleSignOut = useCallback(
    async (callbackUrl: string = window.location.origin) => {
      await signOutUser(callbackUrl);
    },
    [],
  );

  const value: AuthContextValue = {
    ...state,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithCredentials: handleSignInWithCredentials,
    register: handleRegister,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
