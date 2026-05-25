import { useQuery, skipToken } from "@tanstack/react-query";
import { getNearbyStops } from "@/services/stops/stops.api";
import { queryKeys } from "@/hooks/queryKeys";
import { useLocationStore } from "@/store/location.store";
import type { NearbyStop } from "@/services/stops/stops.types";

interface UseNearbyStopsOptions {
  radius?: number;
  enabled?: boolean;
}

export function useNearbyStops({
  radius = 500,
  enabled = true,
}: UseNearbyStopsOptions = {}) {
  const currentLocation = useLocationStore((s) => s.currentLocation);

  const lat = currentLocation?.latitude ?? null;
  const lng = currentLocation?.longitude ?? null;
  const hasLocation = lat !== null && lng !== null && enabled;

  return useQuery<NearbyStop[]>({
    queryKey: hasLocation
      ? queryKeys.stops.nearby(lat!, lng!, radius)
      : queryKeys.stops.all,
    queryFn: hasLocation
      ? () => getNearbyStops(lat!, lng!, radius)
      : skipToken,
    enabled: hasLocation,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });
}
