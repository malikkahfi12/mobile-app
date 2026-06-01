import { get } from "../api/client";
import type { RoutingResult, RoutingParams, Leg } from "./routing.types";
import { decodePolyline6 } from "@/lib/polyline6.helpers";

function decodeLegGeometry(leg: Leg): void {
  const raw = leg.geometry as unknown;
  if (typeof raw !== "string") return;

  try {
    const coords = decodePolyline6(raw);
    const valid = coords.filter(
      (c) => Number.isFinite(c[0]) && Number.isFinite(c[1]),
    );
    leg.geometry =
      valid.length >= 2
        ? { type: "LineString", coordinates: valid as [number, number][] }
        : undefined;
  } catch {
    leg.geometry = undefined;
  }
}

export async function planTrip(params: RoutingParams): Promise<RoutingResult> {
  const result = await get<RoutingResult>(
    "/routing",
    params as unknown as Record<string, unknown>,
  );

  for (const option of result.options) {
    for (const leg of option.legs) {
      decodeLegGeometry(leg);
    }
  }

  return result;
}
