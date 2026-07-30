import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchHostedSessions } from "../lib/dashboard";

export function useHostedSessions(page: number) {
  return useQuery({
    queryKey: ["dashboard", "hosted-sessions", page],
    queryFn: () => fetchHostedSessions({ page }),
    placeholderData: keepPreviousData,
  });
}
