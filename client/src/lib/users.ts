import axios, { isAxiosError } from "axios";
import type { UpdateProfileInput } from "shared";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  avatarColor: string;
  providers: string[];
}

interface ZodFlattenedError {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

interface ProfileErrorResponse {
  error: string | ZodFlattenedError;
}

function isZodFlattenedError(
  error: ProfileErrorResponse["error"],
): error is ZodFlattenedError {
  return typeof error === "object";
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function fetchMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/api/users/me");
  return data;
}

export async function updateMe(
  payload: UpdateProfileInput,
): Promise<UserProfile> {
  try {
    const { data } = await api.patch<UserProfile>("/api/users/me", payload);
    return data;
  } catch (err) {
    if (isAxiosError<ProfileErrorResponse>(err) && err.response) {
      const { error } = err.response.data;
      if (isZodFlattenedError(error)) {
        const message =
          error.formErrors[0] ??
          Object.values(error.fieldErrors).flat().filter(Boolean)[0];
        throw new Error(message ?? "Invalid profile details", { cause: err });
      }
      throw new Error(error, { cause: err });
    }
    throw new Error("Invalid profile details", { cause: err });
  }
}
