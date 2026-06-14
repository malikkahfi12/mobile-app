import { useQuery, skipToken } from "@tanstack/react-query";
import { searchPlaces } from "@/services/places/places.api";
import { queryKeys } from "@/hooks/queryKeys";
import { useLocaleStore } from "@/store/locale.store";
import { buildBbox } from "@/lib/places.helpers";
import type { ExplorePlaceItem } from "@/services/places/places.types";

export function usePlaceSearch(query: string, lat?: number, lng?: number) {
  const locale = useLocaleStore((s) => s.locale);
  const canSearch = query.length >= 2;
  const bbox = lat != null && lng != null ? buildBbox(lat, lng, 50) : undefined;
  const layers = "poi,address,locality";

  return useQuery<{ data: ExplorePlaceItem[]; meta: { query: string; count: number } }>({
    queryKey: queryKeys.places.search(query, bbox, locale, layers),
    queryFn: canSearch
      ? async () => {
          const result = await searchPlaces({ q: query, bbox, limit: 20, lang: locale, layers });
          return { data: result, meta: { query, count: result.length } };
        }
      : skipToken,
    enabled: canSearch,
    staleTime: 30_000,
    gcTime: 1000 * 60 * 5,
  });
}
