import { get } from "../api/client";
import type { NearbyStop, Stop, StopWithDepartures } from "./stops.types";

export async function getNearbyStops(
  lat: number,
  lng: number,
  radius = 500,
  limit?: number,
): Promise<NearbyStop[]> {
  const params: Record<string, unknown> = { lat, lng, radius };
  if (limit !== undefined) params.limit = limit;
  return get<NearbyStop[]>("/stops/nearby", params);
}

export async function getStopById(id: string): Promise<Stop> {
  return get<Stop>(`/stops/${id}`);
}

export async function getStopWithDepartures(
  id: string,
): Promise<StopWithDepartures> {
  return get<StopWithDepartures>(`/stops/${id}/with-departures`);
}

export async function searchStops(query: string): Promise<Stop[]> {
  return get<Stop[]>("/stops", { q: query });
}
