import { useQuery, skipToken } from "@tanstack/react-query";
import { getStopWithDepartures } from "@/services/stops/stops.api";
import { queryKeys } from "@/hooks/queryKeys";
import type { StopWithDepartures } from "@/services/stops/stops.types";

export function useStopDetail(id: string) {
  return useQuery<StopWithDepartures>({
    queryKey: queryKeys.stops.withDepartures(id),
    queryFn: id ? () => getStopWithDepartures(id) : skipToken,
    enabled: !!id && id !== "undefined",
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 2,
    retry: 2,
  });
}
