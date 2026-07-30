import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../lib/dashboard";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });
}
