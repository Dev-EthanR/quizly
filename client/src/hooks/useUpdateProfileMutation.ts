import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMe } from "../lib/users";
import type { UserProfile } from "../entities/user";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (profile: UserProfile) => {
      queryClient.setQueryData(["users", "me"], profile);
    },
  });
}
