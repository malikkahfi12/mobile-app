import { useQuery, skipToken } from "@tanstack/react-query";
import { searchStops } from "@/services/stops/stops.api";
import { queryKeys } from "@/hooks/queryKeys";
import type { Stop } from "@/services/stops/stops.types";

export function useSearchStops(query: string) {
  const canSearch = query.length >= 2;

  return useQuery<Stop[]>({
    queryKey: queryKeys.stops.search(query),
    queryFn: canSearch ? () => searchStops(query) : skipToken,
    enabled: canSearch,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}
