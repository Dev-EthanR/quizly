import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../lib/users";

export function useProfile() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: fetchMe,
  });
}
