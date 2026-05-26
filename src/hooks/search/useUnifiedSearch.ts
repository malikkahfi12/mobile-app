import { useQuery, skipToken } from "@tanstack/react-query";
import { unifiedSearch } from "@/services/search/search.api";
import { queryKeys } from "@/hooks/queryKeys";
import type { UnifiedSearchResponse } from "@/services/search/search.types";

export function useUnifiedSearch(query: string, lat?: number, lng?: number) {
  const canSearch = query.length >= 2;

  return useQuery<UnifiedSearchResponse>({
    queryKey: queryKeys.search.unified(query, lat, lng),
    queryFn: canSearch
      ? () => unifiedSearch({ q: query, lat, lng, limit: 5 })
      : skipToken,
    enabled: canSearch,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}
