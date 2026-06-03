import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDevices, revokeDevice } from "@/services/auth/devices.api";
import { queryKeys } from "@/hooks/queryKeys";
import type { DeviceInfo } from "@/types/auth.types";

export function useDevices() {
  return useQuery<DeviceInfo[]>({
    queryKey: queryKeys.devices.all,
    queryFn: getDevices,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 2,
    retry: 2,
  });
}

export function useRevokeDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => revokeDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.all });
    },
  });
}
