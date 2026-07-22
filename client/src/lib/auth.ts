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

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export async function fetchSession(): Promise<AuthSession | null> {
  const res = await fetch(`${API_URL}/api/auth/session`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Partial<AuthSession>;
  return data?.user ? (data as AuthSession) : null;
}

async function getCsrfToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/csrf`, {
    credentials: "include",
  });
  const data = (await res.json()) as CsrfResponse;
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

export async function signOutUser(callbackUrl: string): Promise<void> {
  const csrfToken = await getCsrfToken();
  submitAuthForm(`${API_URL}/api/auth/signout`, {
    csrfToken,
    callbackUrl,
  });
}
