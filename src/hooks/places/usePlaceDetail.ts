import { useQuery, skipToken } from "@tanstack/react-query";
import { getPlaceDetail } from "@/services/places/places.api";
import { queryKeys } from "@/hooks/queryKeys";
import type { PlaceDetailResponse } from "@/services/places/places.types";

export function usePlaceDetail(id?: string, name?: string, lat?: number, lng?: number) {
  const detailKey = id ?? name ?? "";
  const canFetch = !!id || (!!name && lat != null && lng != null);

  return useQuery<{ data: PlaceDetailResponse }>({
    queryKey: queryKeys.places.detail(detailKey, lat, lng),
    queryFn: canFetch
      ? async () => {
          let result: PlaceDetailResponse;
          if (id) {
            result = await getPlaceDetail(id);
          } else {
            result = await getPlaceDetail(name!, lat!, lng!);
          }
          if (__DEV__) {
            console.log("[usePlaceDetail]", JSON.stringify({ id: id ?? name, nearestStop: result.nearestStop?.name ?? null }, null, 2));
          }
          return { data: result };
        }
      : skipToken,
    enabled: canFetch,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
