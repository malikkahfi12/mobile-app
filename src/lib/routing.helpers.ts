import type { Leg, RouteOption } from "@/services/routing/routing.types";
import type { RouteStop } from "@/services/routes/routes.types";
import { parseCoordinatePair } from "./map.helpers";
import i18n from "@/lib/i18n";

export interface MergedLeg extends Leg {
  intermediateStops?: string[];
}

export function mergeConsecutiveTransitLegs(legs: Leg[]): MergedLeg[] {
  if (legs.length === 0) return [];

  const result: MergedLeg[] = [];

  for (const leg of legs) {
    if (leg.type === "TRANSIT" && leg.routeId) {
      const prev = result[result.length - 1];
      if (
        prev &&
        prev.type === "TRANSIT" &&
        prev.routeId === leg.routeId
      ) {
        prev.toStopId = leg.toStopId;
        prev.toStopName = leg.toStopName;
        prev.toCoordinates = leg.toCoordinates;
        prev.durationSeconds += leg.durationSeconds;
        if (leg.distanceMeters != null) {
          prev.distanceMeters = (prev.distanceMeters ?? 0) + leg.distanceMeters;
        }
        if (leg.geometry && prev.geometry) {
          prev.geometry.coordinates.push(...leg.geometry.coordinates);
        } else if (leg.geometry) {
          prev.geometry = leg.geometry;
        }
        prev.intermediateStops!.push(leg.toStopName);
        if (leg.alternativeRoutes) {
          prev.alternativeRoutes = prev.alternativeRoutes ?? [];
          const existingIds = new Set(prev.alternativeRoutes.map((r) => r.routeId));
          for (const r of leg.alternativeRoutes) {
            if (r.routeId !== leg.routeId && !existingIds.has(r.routeId)) {
              prev.alternativeRoutes.push(r);
              existingIds.add(r.routeId);
            }
          }
        }
        continue;
      }
    }

    const filtered = leg.alternativeRoutes?.filter((r) => r.routeId !== leg.routeId);
    const copy: MergedLeg = { ...leg, alternativeRoutes: filtered?.length ? filtered : undefined };
    if (leg.type === "TRANSIT" && leg.routeId) {
      copy.intermediateStops = [leg.fromStopName, leg.toStopName];
    }
    result.push(copy);
  }

  return result;
}

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
  let count = 0;
  let prevRouteId: string | null | undefined;
  for (const leg of legs) {
    if (leg.type === "TRANSFER") {
      count++;
      continue;
    }
    if (leg.type !== "TRANSIT") continue;
    if (prevRouteId != null && prevRouteId !== leg.routeId) {
      count++;
    }
    prevRouteId = leg.routeId;
  }
  return count;
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
): "walk-outline" | "train-outline" | "subway-outline" | "bus-outline" | "swap-horizontal-outline" {
  if (leg.type === "WALK") return "walk-outline";
  if (leg.type === "TRANSFER") return "swap-horizontal-outline";

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
      const dist = d >= 1000 ? `${(d / 1000).toFixed(1)}km` : `${Math.round(d)}m`;
      return `${i18n.t("common.walk")} ${dist}`;
    }
    return i18n.t("common.walk");
  }
  if (leg.type === "TRANSFER") {
    return i18n.t("journey.transferStation");
  }
  return leg.routeName || i18n.t("common.transit");
}

export function getLegDetail(leg: Leg): string {
  if (leg.type === "TRANSIT") {
    const parts: string[] = [];
    const min = Math.round(leg.durationSeconds / 60);
    if (min > 0) parts.push(`${min}${i18n.t("guidance.minRide")}`);
    if (leg.routeName) parts.push(`${i18n.t("journey.linePrefix")}${leg.routeName}`);
    return parts.join(" · ");
  }
  return "";
}

export function getLegsSummary(legs: Leg[]): string {
  const labels: string[] = [];
  let lastLabel = "";
  for (const leg of legs) {
    const label = getLegLabel(leg);
    if (label !== lastLabel) {
      labels.push(label);
      lastLabel = label;
    }
  }
  return labels.join(" → ");
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
  const routeName = leg.routeName || i18n.t("common.transit");
  const headsign = leg.headsign;
  if (headsign) return i18n.t("guidance.boardToward", { routeName, headsign });
  return i18n.t("guidance.takeRoute", { routeName });
}

export function getWalkingInstruction(leg: Leg): string {
  const distance = leg.distanceMeters;
  const durationMin = Math.round(leg.durationSeconds / 60);
  if (distance != null && durationMin > 0) {
    const dist = distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${Math.round(distance)}m`;
    return `${i18n.t("common.walk")} ${dist} to ${leg.toStopName} (${durationMin} min)`;
  }
  if (distance != null) {
    const dist = distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${Math.round(distance)}m`;
    return `${i18n.t("common.walk")} ${dist} to ${leg.toStopName}`;
  }
  return i18n.t("guidance.walkTo", { stopName: leg.toStopName });
}

export function getTransferText(leg: Leg, nextLeg?: Leg): string | null {
  if (
    leg.type !== "TRANSIT" ||
    !nextLeg ||
    nextLeg.type !== "TRANSIT" ||
    leg.routeId === nextLeg.routeId
  )
    return null;
  const routeName = nextLeg.routeName || i18n.t("guidance.nextRoute");
  return i18n.t("guidance.transferAt", { routeName, stopName: leg.toStopName });
}

export function getInstructionTitle(
  leg: Leg,
  isLastLeg: boolean,
  destinationName?: string | null,
): string {
  if (isLastLeg) {
    if (leg.type === "WALK") return destinationName ? i18n.t("guidance.arriveAt", { destination: destinationName }) : i18n.t("guidance.arriveDestination");
    return leg.toStopName ? i18n.t("guidance.getOffAt", { stopName: leg.toStopName }) : i18n.t("guidance.getOff");
  }
  if (leg.type === "WALK") return i18n.t("guidance.walkTo", { stopName: leg.toStopName });
  const routeName = leg.routeName || i18n.t("common.transit");
  return i18n.t("guidance.takeRoute", { routeName });
}

export function getInstructionSubtitle(leg: Leg, isLastLeg: boolean): string {
  const durationMin = Math.round(leg.durationSeconds / 60);
  const parts: string[] = [];

  if (leg.type === "WALK") {
    const dist = leg.distanceMeters;
    if (dist != null) {
      parts.push(dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${Math.round(dist)} m`);
    }
    if (durationMin > 0) parts.push(`${durationMin} min`);
    return parts.join(" · ");
  }

  if (durationMin > 0) parts.push(`${durationMin} min`);

  if (isLastLeg) return parts.join(" · ");

  if (leg.type === "TRANSIT" && leg.headsign) {
    parts.push(i18n.t("guidance.toward", { headsign: leg.headsign }));
  }

  return parts.join(" · ");
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

export function getStrategyLabel(strategy: string): string {
  switch (strategy) {
    case "FASTEST":
      return i18n.t("routes.strategyFastest");
    case "FEWER_TRANSITS":
      return i18n.t("routes.strategyFewerTransfers");
    case "LESS_WALKING":
      return i18n.t("routes.strategyLessWalking");
    default:
      return strategy;
  }
}

export function getStrategyColor(strategy: string): string {
  switch (strategy) {
    case "FASTEST":
      return "#22C55E";
    case "FEWER_TRANSITS":
      return "#3B82F6";
    case "LESS_WALKING":
      return "#F59E0B";
    default:
      return "#6B7280";
  }
}

export function getStrategyIcon(strategy: string): "flash-outline" | "layers-outline" | "walk-outline" | "help-circle-outline" {
  switch (strategy) {
    case "FASTEST":
      return "flash-outline";
    case "FEWER_TRANSITS":
      return "layers-outline";
    case "LESS_WALKING":
      return "walk-outline";
    default:
      return "help-circle-outline";
  }
}

export function formatWaitingTime(seconds: number): string | null {
  if (seconds <= 0) return null;
  const min = Math.round(seconds / 60);
  return `${min} ${i18n.t("routes.minWait")}`;
}

export function getAlternativeRoutesLabel(alternativeRoutes?: { routeId: string; routeName: string }[]): string | null {
  if (!alternativeRoutes || alternativeRoutes.length === 0) return null;
  return alternativeRoutes.map((r) => r.routeName).join(" / ");
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
