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

const METERS_PER_DEG_LAT = 111_320;

function metersPerDegLng(lat: number): number {
  return METERS_PER_DEG_LAT * Math.cos(toRad(lat));
}

function toEuclidean(
  lng: number,
  lat: number,
  originLat: number,
  originLng: number,
): [number, number] {
  const y = (lat - originLat) * METERS_PER_DEG_LAT;
  const x = (lng - originLng) * metersPerDegLng(originLat);
  return [x, y];
}

function fromEuclidean(
  x: number,
  y: number,
  originLat: number,
  originLng: number,
): [number, number] {
  const lat = originLat + y / METERS_PER_DEG_LAT;
  const lng = originLng + x / metersPerDegLng(originLat);
  return [lng, lat];
}

export interface PolylineSplitResult {
  past: [number, number][];
  future: [number, number][];
}

export function splitPolylineAtUser(
  coords: [number, number][],
  user: Coordinates,
): PolylineSplitResult | null {
  if (coords.length < 2) return null;

  let minDist = Infinity;
  let closestIdx = 0;
  for (let i = 0; i < coords.length; i++) {
    const d = haversineDistance(user, {
      latitude: coords[i][1],
      longitude: coords[i][0],
    });
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }

  let bestLng = coords[closestIdx][0];
  let bestLat = coords[closestIdx][1];
  let bestIdx = closestIdx;

  const segments: [number, number][] = [];
  if (closestIdx > 0) segments.push([closestIdx - 1, closestIdx]);
  if (closestIdx < coords.length - 1) segments.push([closestIdx, closestIdx + 1]);

  const olat = user.latitude;
  const olng = user.longitude;

  for (const [ai, bi] of segments) {
    const [ax, ay] = toEuclidean(coords[ai][0], coords[ai][1], olat, olng);
    const [bx, by] = toEuclidean(coords[bi][0], coords[bi][1], olat, olng);
    const abx = bx - ax;
    const aby = by - ay;
    const lenSq = abx * abx + aby * aby;
    if (lenSq < 1e-6) continue;

    const t = Math.max(
      0,
      Math.min(1, ((0 - ax) * abx + (0 - ay) * aby) / lenSq),
    );
    const [plng, plat] = fromEuclidean(ax + t * abx, ay + t * aby, olat, olng);
    const d = haversineDistance(user, { latitude: plat, longitude: plng });
    if (d < minDist) {
      minDist = d;
      bestLng = plng;
      bestLat = plat;
      bestIdx = ai;
    }
  }

  const splitPt: [number, number] = [bestLng, bestLat];
  const past: [number, number][] = [...coords.slice(0, bestIdx + 1), splitPt];
  const future: [number, number][] = [splitPt, ...coords.slice(bestIdx + 1)];

  if (past.length < 2 && future.length < 2) return null;
  return { past, future };
}
