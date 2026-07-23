import axios, { isAxiosError } from "axios";

export interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

interface CsrfResponse {
  csrfToken: string;
}

export interface CredentialsPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends CredentialsPayload {
  name: string;
}

interface RegisterSuccessResponse {
  message: string;
}

interface ZodFlattenedError {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

interface RegisterErrorResponse {
  error: string | ZodFlattenedError;
}

interface AuthCallbackResponse {
  url: string;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

function isZodFlattenedError(
  error: RegisterErrorResponse["error"],
): error is ZodFlattenedError {
  return typeof error === "object";
}

export async function fetchSession(): Promise<AuthSession | null> {
  try {
    const { data } = await api.get<Partial<AuthSession>>("/api/auth/session");
    return data?.user ? (data as AuthSession) : null;
  } catch {
    return null;
  }
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterSuccessResponse> {
  try {
    const { data } = await api.post<RegisterSuccessResponse>(
      "/api/register",
      payload,
    );
    return data;
  } catch (err) {
    if (isAxiosError<RegisterErrorResponse>(err) && err.response) {
      const { error } = err.response.data;
      if (isZodFlattenedError(error)) {
        const message =
          error.formErrors[0] ??
          Object.values(error.fieldErrors).flat().filter(Boolean)[0];
        throw new Error(message ?? "Invalid registration details", {
          cause: err,
        });
      }
      throw new Error(error, { cause: err });
    }
    throw new Error("Invalid registration details", { cause: err });
  }
}

async function getCsrfToken(): Promise<string> {
  const { data } = await api.get<CsrfResponse>("/api/auth/csrf");
  return data.csrfToken;
}

function submitAuthForm(action: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export async function signInWithGoogle(callbackUrl: string): Promise<void> {
  const csrfToken = await getCsrfToken();
  submitAuthForm(`${API_URL}/api/auth/signin/google`, {
    csrfToken,
    callbackUrl,
  });
}

export async function signInWithCredentials(
  payload: CredentialsPayload,
  callbackUrl: string,
): Promise<void> {
  const csrfToken = await getCsrfToken();
  const { data } = await api.post<AuthCallbackResponse>(
    "/api/auth/callback/credentials",
    { ...payload, csrfToken, callbackUrl },
    { headers: { "X-Auth-Return-Redirect": "1" } },
  );

  const error = new URL(data.url).searchParams.get("error");
  if (error) {
    throw new Error(
      error === "CredentialsSignin"
        ? "Incorrect email or password"
        : "Unable to sign in",
    );
  }
}

export async function signOutUser(callbackUrl: string): Promise<void> {
  const csrfToken = await getCsrfToken();
  submitAuthForm(`${API_URL}/api/auth/signout`, {
    csrfToken,
    callbackUrl,
  });
}
