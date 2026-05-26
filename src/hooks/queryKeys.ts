import { queryClient } from "@/providers/QueryProvider";

export const queryKeys = {
  stops: {
    all: ["stops"] as const,
    nearby: (lat: number, lng: number, radius: number) =>
      [...queryKeys.stops.all, "nearby", { lat, lng, radius }] as const,
    search: (query: string) =>
      [...queryKeys.stops.all, "search", query] as const,
    detail: (id: string) =>
      [...queryKeys.stops.all, "detail", id] as const,
    withDepartures: (id: string) =>
      [...queryKeys.stops.all, "withDepartures", id] as const,
  },

  departures: {
    all: ["departures"] as const,
    byStop: (stopId: string, limit: number) =>
      [...queryKeys.departures.all, "byStop", { stopId, limit }] as const,
    batch: (stopIds: string[], limit?: number) =>
      [...queryKeys.departures.all, "batch", { stopIds, limit }] as const,
  },

  routing: {
    all: ["routing"] as const,
    trip: (params: {
      fromStopId: string;
      toStopId: string;
      departureTimeSeconds?: number;
    }) => [...queryKeys.routing.all, "trip", params] as const,
  },

  routes: {
    all: ["routes"] as const,
    detail: (id: string) =>
      [...queryKeys.routes.all, "detail", id] as const,
    stops: (id: string) =>
      [...queryKeys.routes.all, "stops", id] as const,
  },

  search: {
    all: ["search"] as const,
    unified: (query: string, lat?: number, lng?: number) =>
      [...queryKeys.search.all, "unified", { query, lat, lng }] as const,
  },

  trips: {
    all: ["trips"] as const,
    shape: (tripId: string) =>
      [...queryKeys.trips.all, "shape", tripId] as const,
  },
};

export function invalidateStops() {
  return queryClient.invalidateQueries({ queryKey: queryKeys.stops.all });
}

export function invalidateDepartures() {
  return queryClient.invalidateQueries({ queryKey: queryKeys.departures.all });
}
