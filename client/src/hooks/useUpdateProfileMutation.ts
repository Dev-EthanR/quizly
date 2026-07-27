import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "../lib/users";
import { updateMe } from "../lib/users";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (profile: UserProfile) => {
      queryClient.setQueryData(["users", "me"], profile);
    },
  });
}
