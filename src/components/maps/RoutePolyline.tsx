import { memo, useMemo } from "react";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import type { Leg } from "@/services/routing/routing.types";
import type { Coordinates } from "@/services/location/location.types";
import { splitPolylineAtUser } from "@/lib/location.helpers";
import { parseCoordinatePair } from "@/lib/map.helpers";

interface RoutePolylineProps {
  legs: Leg[];
  activeLegIndex?: number;
  userLocation?: Coordinates | null;
}

const WALK_COLOR = "#9CA3AF";
const PAST_COLOR = "#9CA3AF";
const TRANSIT_COLOR = "#0000FF";
const WALK_WIDTH = 2;
const TRANSIT_WIDTH = 4;
const ACTIVE_TRANSIT_WIDTH = 5;
const WALK_DASH = [4, 4];
const WALK_OPACITY = 0.6;
const PAST_TRANSIT_OPACITY = 0.7;
const PAST_ACTIVE_OPACITY = 0.4;

const LINE_LAYOUT = {
  "line-cap": "round" as const,
  "line-join": "round" as const,
};

function isFiniteCoord(c: [number, number]): boolean {
  return Number.isFinite(c[0]) && Number.isFinite(c[1]);
}

function getLineCoordinates(leg: Leg): [number, number][] | null {
  if (leg.geometry?.coordinates && leg.geometry.coordinates.length >= 2) {
    const valid = leg.geometry.coordinates.filter(isFiniteCoord);
    if (valid.length >= 2) return valid;
  }

  const from = parseCoordinatePair(leg.fromCoordinates);
  const to = parseCoordinatePair(leg.toCoordinates);
  if (!from || !to) return null;

  return [from, to];
}

interface LegSourceData {
  sourceId: string;
  layerId: string;
  coords: [number, number][];
  isWalk: boolean;
  isPast: boolean;
  color: string;
  opacity: number;
  width: number;
}

function buildLegSources(
  legs: Leg[],
  activeLegIndex?: number,
  userLocation?: Coordinates | null,
): LegSourceData[] {
  return legs.flatMap((leg, li) => {
    const coords = getLineCoordinates(leg);
    if (!coords) return [];

    const isWalk = leg.type === "WALK";
    const isPast = activeLegIndex != null && li < activeLegIndex;
    const isActive = activeLegIndex != null && li === activeLegIndex && !isWalk;

    if (isActive && userLocation && coords.length >= 2) {
      const split = splitPolylineAtUser(coords, userLocation);
      if (split) {
        const entries: LegSourceData[] = [];

        if (split.past.length >= 2) {
          entries.push({
            sourceId: `route-leg-${li}-past`,
            layerId: `route-leg-layer-${li}-past`,
            coords: split.past,
            isWalk: false,
            isPast: true,
            color: PAST_COLOR,
            opacity: PAST_ACTIVE_OPACITY,
            width: TRANSIT_WIDTH,
          });
        }

        if (split.future.length >= 2) {
          entries.push({
            sourceId: `route-leg-${li}-future`,
            layerId: `route-leg-layer-${li}-future`,
            coords: split.future,
            isWalk: false,
            isPast: false,
            color: TRANSIT_COLOR,
            opacity: 1,
            width: ACTIVE_TRANSIT_WIDTH,
          });
        }

        if (entries.length > 0) return entries;
      }
    }

    const color = isPast ? PAST_COLOR : isWalk ? WALK_COLOR : TRANSIT_COLOR;
    const opacity = isWalk ? WALK_OPACITY : isPast ? PAST_TRANSIT_OPACITY : 1;
    return [
      {
        sourceId: `route-leg-${li}`,
        layerId: `route-leg-layer-${li}`,
        coords,
        isWalk,
        isPast,
        color,
        opacity,
        width: isActive
          ? ACTIVE_TRANSIT_WIDTH
          : isWalk
            ? WALK_WIDTH
            : TRANSIT_WIDTH,
      },
    ];
  });
}

export const RoutePolyline = memo(function RoutePolyline({
  legs,
  activeLegIndex,
  userLocation,
}: RoutePolylineProps) {
  const legSources = useMemo(
    () => buildLegSources(legs, activeLegIndex, userLocation),
    [legs, activeLegIndex, userLocation],
  );

  return (
    <>
      {legSources.map((leg) => (
        <GeoJSONSource
          key={leg.sourceId}
          id={leg.sourceId}
          data={{
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: leg.coords,
            },
          }}
        >
          <Layer
            id={leg.layerId}
            type="line"
            paint={{
              "line-color": leg.color,
              "line-width": leg.width,
              ...(leg.isWalk ? { "line-dasharray": WALK_DASH } : {}),
              "line-opacity": leg.opacity,
            }}
            layout={LINE_LAYOUT}
          />
          {!leg.isWalk && (
            <Layer
              id={`${leg.layerId}-arrows`}
              type="symbol"
              paint={{
                "text-color": leg.color,
                "text-opacity": leg.opacity,
              }}
              layout={{
                "symbol-placement": "line",
                "text-field": "►",
                "text-size": 10,
                "text-allow-overlap": true,
                "symbol-spacing": 80,
              }}
            />
          )}
        </GeoJSONSource>
      ))}
    </>
  );
});
