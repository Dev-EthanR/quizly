import { useQuery } from "@tanstack/react-query";
import { fetchHostedSessionDetail } from "../lib/dashboard";

export function useHostedSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", "hosted-session", sessionId],
    queryFn: () => fetchHostedSessionDetail(sessionId!),
    enabled: !!sessionId,
  });
}
