import { isAxiosError } from "axios";

interface ZodFlattenedError {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

interface ApiErrorResponse {
  error: string | ZodFlattenedError;
}

function isZodFlattenedError(
  error: ApiErrorResponse["error"],
): error is ZodFlattenedError {
  return typeof error === "object";
}

export function extractApiErrorMessage(
  err: unknown,
  fallbackMessage: string,
): string {
  if (isAxiosError<ApiErrorResponse>(err) && err.response) {
    const { error } = err.response.data;
    if (isZodFlattenedError(error)) {
      return (
        error.formErrors[0] ??
        Object.values(error.fieldErrors).flat().filter(Boolean)[0] ??
        fallbackMessage
      );
    }
    return error;
  }
  return fallbackMessage;
}
