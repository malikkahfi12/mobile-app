import { useQuery, skipToken } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { getRouteById, getRouteStops } from "@/services/routes/routes.api";
import { queryKeys } from "@/hooks/queryKeys";
import type { Route, RouteStop } from "@/services/routes/routes.types";

export function useRouteDetail(id: string) {
  const routeQuery = useQuery<Route>({
    queryKey: queryKeys.routes.detail(id),
    queryFn: id ? () => getRouteById(id) : skipToken,
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const stopsQuery = useQuery<RouteStop[]>({
    queryKey: queryKeys.routes.stops(id),
    queryFn: id ? () => getRouteStops(id) : skipToken,
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const refetch = useCallback(() => {
    routeQuery.refetch();
    stopsQuery.refetch();
  }, [routeQuery, stopsQuery]);

  return useMemo(
    () => ({
      route: routeQuery.data,
      stops: stopsQuery.data,
      isLoading: routeQuery.isLoading || stopsQuery.isLoading,
      isError: routeQuery.isError,
      refetch,
    }),
    [routeQuery.data, stopsQuery.data, routeQuery.isLoading, stopsQuery.isLoading, routeQuery.isError, refetch],
  );
}
