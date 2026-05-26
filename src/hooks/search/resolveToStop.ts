import { getNearbyStops } from "@/services/stops/stops.api";
import type { NearbyStop } from "@/services/stops/stops.types";

export async function resolveToStop(
  lat: number,
  lng: number,
): Promise<NearbyStop | null> {
  try {
    const stops = await getNearbyStops(lat, lng, 2000);
    return stops.length > 0 ? stops[0] : null;
  } catch {
    return null;
  }
}
