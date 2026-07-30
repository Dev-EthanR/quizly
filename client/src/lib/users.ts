import type { UpdateProfileInput } from "shared";
import api from "./api";
import { extractApiErrorMessage } from "./apiError";
import type { UserProfile } from "../entities/user";

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
    throw new Error(extractApiErrorMessage(err, "Invalid profile details"), {
      cause: err,
    });
  }
}
