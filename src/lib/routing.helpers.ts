import type { Leg, RouteOption } from "@/services/routing/routing.types";
import type { RouteStop } from "@/services/routes/routes.types";
import { parseCoordinatePair } from "./map.helpers";

export function getTotalDuration(legs: Leg[]): number {
  return Math.round(
    legs.reduce((sum, l) => sum + l.durationSeconds, 0) / 60,
  );
}

export function getWalkingDistance(legs: Leg[]): number {
  return legs
    .filter((l) => l.type === "WALK")
    .reduce((sum, l) => sum + (l.distanceMeters ?? 0), 0);
}

export function getWalkingDuration(legs: Leg[]): number | null {
  const meters = getWalkingDistance(legs);
  if (meters === 0) return null;
  return Math.round(meters / 83.3);
}

export function getTransferCount(legs: Leg[]): number {
  const transit = legs.filter((l) => l.type === "TRANSIT").length;
  return Math.max(0, transit - 1);
}

export function getTransitLegs(legs: Leg[]): Leg[] {
  return legs.filter((l) => l.type === "TRANSIT");
}

export function isWalkOnly(option: RouteOption): boolean {
  return option.legs.length > 0 && option.legs.every((l) => l.type === "WALK");
}

export function getBestOptionIndex(options: RouteOption[]): number | null {
  let bestIndex: number | null = null;
  let bestDuration: number | null = null;

  for (let i = 0; i < options.length; i++) {
    const d = options[i].totalDurationSeconds;
    if (bestDuration == null || d < bestDuration) {
      bestDuration = d;
      bestIndex = i;
    }
  }

  if (bestIndex == null && options.length > 0) return 0;
  return bestIndex;
}

export function getLegIcon(
  leg: Leg,
): "walk-outline" | "train-outline" | "subway-outline" | "bus-outline" {
  if (leg.type === "WALK") return "walk-outline";

  const name = (leg.routeName ?? "").toLowerCase();
  if (name.includes("train") || name.includes("rail") || name.includes("mrt"))
    return "train-outline";
  if (
    name.includes("subway") ||
    name.includes("metro") ||
    name.includes("lrt")
  )
    return "subway-outline";
  if (name.includes("tram") || name.includes("light")) return "train-outline";
  return "bus-outline";
}

export function getLegLabel(leg: Leg): string {
  if (leg.type === "WALK") {
    const d = leg.distanceMeters;
    if (d != null) {
      if (d >= 1000) return `Walk ${(d / 1000).toFixed(1)}km`;
      return `Walk ${Math.round(d)}m`;
    }
    return "Walk";
  }
  return leg.routeName || "Transit";
}

export function getLegDetail(leg: Leg): string {
  if (leg.type === "TRANSIT") {
    const parts: string[] = [];
    const min = Math.round(leg.durationSeconds / 60);
    if (min > 0) parts.push(`${min} min ride`);
    if (leg.routeName) parts.push(`Line ${leg.routeName}`);
    return parts.join(" · ");
  }
  return "";
}

export function getLegsSummary(legs: Leg[]): string {
  return legs.map((leg) => getLegLabel(leg)).join(" → ");
}

export function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function getLegDurationMinutes(leg: Leg): number {
  return Math.round(leg.durationSeconds / 60);
}

export function formatETATime(seconds: number): string {
  const date = new Date(seconds * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function getBoardingInstruction(leg: Leg): string {
  const routeName = leg.routeName || "transit";
  const headsign = leg.headsign;
  if (headsign) return `Board ${routeName} toward ${headsign}`;
  return `Take ${routeName}`;
}

export function getWalkingInstruction(leg: Leg): string {
  const distance = leg.distanceMeters;
  const durationMin = Math.round(leg.durationSeconds / 60);
  if (distance != null && durationMin > 0) {
    if (distance >= 1000) {
      return `Walk ${(distance / 1000).toFixed(1)}km to ${leg.toStopName}`;
    }
    return `Walk ${Math.round(distance)}m to ${leg.toStopName} (${durationMin} min)`;
  }
  if (distance != null) {
    if (distance >= 1000) {
      return `Walk ${(distance / 1000).toFixed(1)}km to ${leg.toStopName}`;
    }
    return `Walk ${Math.round(distance)}m to ${leg.toStopName}`;
  }
  return `Walk to ${leg.toStopName}`;
}

export function getTransferText(leg: Leg, nextLeg?: Leg): string | null {
  if (leg.type !== "TRANSIT" || !nextLeg || nextLeg.type !== "TRANSIT")
    return null;
  const routeName = nextLeg.routeName || "next route";
  return `Transfer to ${routeName} at ${leg.toStopName}`;
}

export function countLegStops(
  stops: RouteStop[] | undefined,
  fromStopId: string,
  toStopId: string,
): number | null {
  if (!stops?.length) return null;
  const fromIdx = stops.findIndex((s) => s.id === fromStopId);
  const toIdx = stops.findIndex((s) => s.id === toStopId);
  if (fromIdx === -1 || toIdx === -1) return null;
  const diff = Math.abs(toIdx - fromIdx);
  return diff;
}

function dedupeCoords(coords: [number, number][]): [number, number][] {
  const result: [number, number][] = [];
  for (const c of coords) {
    const last = result[result.length - 1];
    if (!last || last[0] !== c[0] || last[1] !== c[1]) {
      result.push(c);
    }
  }
  return result;
}

export function getRouteCoordinates(option: RouteOption): [number, number][] {
  const coords: [number, number][] = [];

  for (const leg of option.legs) {
    if (leg.geometry?.coordinates && leg.geometry.coordinates.length >= 2) {
      for (const c of leg.geometry.coordinates) {
        if (Number.isFinite(c[0]) && Number.isFinite(c[1])) {
          coords.push(c);
        }
      }
    } else {
      const from = parseCoordinatePair(leg.fromCoordinates);
      const to = parseCoordinatePair(leg.toCoordinates);
      if (from) coords.push(from);
      if (to) coords.push(to);
    }
  }

  return dedupeCoords(coords);
}
