import { useMutation } from "@tanstack/react-query";
import { uploadAvatar } from "@/services/auth/profile";
import { useAuthStore } from "@/store/auth.store";

export function useUploadAvatar() {
  const patchUser = useAuthStore((s) => s.patchUser);

  return useMutation<{ avatarUrl: string }, Error, string>({
    mutationFn: (uri: string) => uploadAvatar(uri),
    onSuccess: (data) => {
      patchUser({ avatarUrl: data.avatarUrl });
    },
  });
}
