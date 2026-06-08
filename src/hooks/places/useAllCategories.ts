import { useQueries } from "@tanstack/react-query";
import { explorePlaces } from "@/services/places/places.api";
import { queryKeys } from "@/hooks/queryKeys";
import { buildBbox } from "@/lib/places.helpers";
import { CATEGORIES } from "@/services/places/places.mock";
import type { ExplorePlaceItem, PlaceCategory } from "@/services/places/places.types";

const LIMIT_PER_CATEGORY = 6;

interface AllCategoriesResult {
  categories: Record<string, ExplorePlaceItem[]>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useAllCategories(
  lat: number | undefined,
  lng: number | undefined,
): AllCategoriesResult {
  const bbox = lat != null && lng != null ? buildBbox(lat, lng, 10) : null;

  const categoryKeys = CATEGORIES
    .filter((c) => c.key !== "place")
    .map((c) => c.key) as Exclude<PlaceCategory, "place">[];

  const results = useQueries({
    queries: categoryKeys.map((category) => ({
      queryKey: queryKeys.places.explore(bbox ?? "", category),
      queryFn: bbox
        ? async () => {
            const data = await explorePlaces({
              bbox,
              category,
              limit: LIMIT_PER_CATEGORY,
            });
            return data;
          }
        : () => {
            throw new Error("bbox not available");
          },
      enabled: bbox !== null,
      staleTime: 30_000,
      gcTime: 1000 * 60 * 5,
    })),
  });

  const categories: Record<string, ExplorePlaceItem[]> = {};
  let anyLoading = false;
  let anyFetching = false;
  let anyError = false;

  for (let i = 0; i < categoryKeys.length; i++) {
    const key = categoryKeys[i];
    const query = results[i];
    categories[key] = Array.isArray(query.data) ? query.data : [];
    if (query.isLoading) anyLoading = true;
    if (query.isFetching) anyFetching = true;
    if (query.isError) anyError = true;
  }

  const refetch = () => results.forEach((q) => q.refetch());

  return { categories, isLoading: anyLoading, isFetching: anyFetching, isError: anyError, refetch };
}
