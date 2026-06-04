import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectGoogleAccount } from "@/services/auth/googleConnect.api";
import { useGoogleRecoveryStore } from "@/store/googleRecovery.store";
import { queryKeys } from "@/hooks/queryKeys";
import type { GoogleIdentityInfo } from "@/types/google.types";

export function useGoogleConnect() {
  const queryClient = useQueryClient();
  const setGoogleEmail = useGoogleRecoveryStore((s) => s.setGoogleEmail);

  return useMutation<GoogleIdentityInfo, Error, string>({
    mutationKey: queryKeys.googleConnect.all,
    mutationFn: (idToken: string) => connectGoogleAccount(idToken),
    onSuccess: (data) => {
      setGoogleEmail(data.email);
      queryClient.invalidateQueries({
        queryKey: queryKeys.googleConnect.all,
      });
    },
  });
}
