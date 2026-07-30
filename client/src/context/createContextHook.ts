import { useContext, type Context } from "react";

export function useRequiredContext<T>(
  context: Context<T | undefined>,
  providerName: string,
): T {
  const value = useContext(context);
  if (!value) {
    throw new Error(`This hook must be used within a ${providerName}`);
  }
  return value;
}
