import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/services/auth/profile";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/types/auth.types";

interface UpdateProfileVars {
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export function useUpdateProfile() {
  const patchUser = useAuthStore((s) => s.patchUser);

  return useMutation<User, Error, UpdateProfileVars>({
    mutationFn: (body) => updateProfile(body),
    onSuccess: (user) => {
      patchUser(user);
    },
  });
}
