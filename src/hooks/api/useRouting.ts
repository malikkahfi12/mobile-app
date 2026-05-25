import { useQuery, skipToken } from "@tanstack/react-query";
import { planTrip } from "@/services/routing/routing.api";
import { queryKeys } from "@/hooks/queryKeys";
import type { RoutingResult, RoutingParams } from "@/services/routing/routing.types";

export function useRouting(params: RoutingParams | null) {
  return useQuery<RoutingResult>({
    queryKey: params
      ? queryKeys.routing.trip(params)
      : queryKeys.routing.all,
    queryFn: params ? () => planTrip(params) : skipToken,
    enabled: !!params,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}
