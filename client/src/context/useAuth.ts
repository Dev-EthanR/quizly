import { useRequiredContext } from "./createContextHook";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function useAuth(): AuthContextValue {
  return useRequiredContext(AuthContext, "AuthProvider");
}
