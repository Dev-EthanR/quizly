import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchRecentGames } from "../lib/dashboard";

export function useRecentGames(page: number) {
  return useQuery({
    queryKey: ["dashboard", "games", page],
    queryFn: () => fetchRecentGames({ page }),
    placeholderData: keepPreviousData,
  });
}
