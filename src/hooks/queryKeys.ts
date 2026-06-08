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
    unified: (query: string, lat?: number, lng?: number, lang?: string) =>
      [...queryKeys.search.all, "unified", { query, lat, lng, lang }] as const,
  },

  trips: {
    all: ["trips"] as const,
    shape: (tripId: string) =>
      [...queryKeys.trips.all, "shape", tripId] as const,
  },

  places: {
    all: ["places"] as const,
    search: (q: string, bbox?: string, lang?: string) =>
      [...queryKeys.places.all, "search", { q, bbox, lang }] as const,
    explore: (bbox: string, category?: string) =>
      [...queryKeys.places.all, "explore", { bbox, category }] as const,
    detail: (idOrName: string, lat?: number, lng?: number) =>
      [...queryKeys.places.all, "detail", { idOrName, lat, lng }] as const,
    reverse: (lat: number, lng: number) =>
      [...queryKeys.places.all, "reverse", { lat, lng }] as const,
  },

  devices: {
    all: ["devices"] as const,
  },

  googleConnect: {
    all: ["google-connect"] as const,
  },
};

export function invalidateStops() {
  return queryClient.invalidateQueries({ queryKey: queryKeys.stops.all });
}

export function invalidateDepartures() {
  return queryClient.invalidateQueries({ queryKey: queryKeys.departures.all });
}
