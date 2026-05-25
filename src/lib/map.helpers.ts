import type { Leg } from "@/services/routing/routing.types";

export function parseCoordinatePair(
  str: string | undefined,
): [number, number] | null {
  if (!str) return null;
  const parts = str.split(",");
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return [lng, lat];
}

export interface Bounds {
  sw: [number, number];
  ne: [number, number];
}

export function computeBounds(coords: [number, number][]): Bounds | null {
  if (coords.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lng, lat] of coords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return {
    sw: [minLng, minLat],
    ne: [maxLng, maxLat],
  };
}

export function getLegBounds(leg: Leg): Bounds | null {
  const coords: [number, number][] = [];

  if (leg.geometry?.coordinates && leg.geometry.coordinates.length >= 2) {
    for (const c of leg.geometry.coordinates) {
      if (Number.isFinite(c[0]) && Number.isFinite(c[1])) coords.push(c);
    }
  }

  if (coords.length < 2) {
    const from = parseCoordinatePair(leg.fromCoordinates);
    const to = parseCoordinatePair(leg.toCoordinates);
    if (from) coords.push(from);
    if (to) coords.push(to);
  }

  return coords.length >= 2 ? computeBounds(coords) : null;
}
