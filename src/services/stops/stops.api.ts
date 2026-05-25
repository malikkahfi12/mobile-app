import { get } from "../api/client";
import type { NearbyStop, Stop, StopWithDepartures } from "./stops.types";

export async function getNearbyStops(
  lat: number,
  lng: number,
  radius = 500,
): Promise<NearbyStop[]> {
  return get<NearbyStop[]>("/stops/nearby", { lat, lng, radius });
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
