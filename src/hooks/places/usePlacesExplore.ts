import { useQuery, skipToken } from "@tanstack/react-query";
import { explorePlaces } from "@/services/places/places.api";
import { queryKeys } from "@/hooks/queryKeys";
import { buildBbox } from "@/lib/places.helpers";
import type { ExplorePlaceItem, PlaceCategory } from "@/services/places/places.types";

export function usePlacesExplore(
  lat: number | undefined,
  lng: number | undefined,
  category: PlaceCategory,
) {
  const bbox = lat != null && lng != null ? buildBbox(lat, lng, 10) : null;

  return useQuery<{ data: ExplorePlaceItem[]; meta: { bbox: string; count: number } }>({
    queryKey: queryKeys.places.explore(bbox ?? "", category),
    queryFn: bbox
      ? async () => {
          const result = await explorePlaces({
            bbox,
            category: category === "place" ? undefined : category,
            limit: 20,
          });
          return { data: result, meta: { bbox, count: result.length } };
        }
      : skipToken,
    enabled: bbox !== null && category !== "place",
    staleTime: 30_000,
    gcTime: 1000 * 60 * 5,
  });
}
