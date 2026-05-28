import type { Coordinates } from "@/services/location/location.types";

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

function wrapBearing(bearing: number): number {
  let b = bearing % 360;
  if (b < 0) b += 360;
  return b;
}

export function smoothHeading(
  previous: number | null,
  current: number,
  factor: number,
): number {
  if (previous === null) return current;

  let delta = wrapBearing(current) - wrapBearing(previous);
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  return wrapBearing(wrapBearing(previous) + delta * factor);
}

export function headingChanged(
  previous: number | null,
  current: number,
  minChange: number,
): boolean {
  if (previous === null) return true;

  let delta = Math.abs(wrapBearing(current) - wrapBearing(previous));
  if (delta > 180) delta = 360 - delta;

  return delta >= minChange;
}

export function shouldUpdateLocation(
  previous: Coordinates | null,
  next: Coordinates,
  minDistance: number,
  maxAccuracy: number,
  accuracy: number | null,
): boolean {
  if (previous === null) return true;

  if (accuracy !== null && accuracy > maxAccuracy) return false;

  const distance = haversineDistance(previous, next);
  return distance >= minDistance;
}
