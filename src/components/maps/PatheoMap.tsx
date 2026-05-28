import { type ReactNode, memo, useCallback } from "react";
import { Map } from "@maplibre/maplibre-react-native";
import { MapCamera } from "./MapCamera";
import { MAP_STYLE, INITIAL_CENTER, INITIAL_ZOOM } from "@/constants/map";
import type { Bounds } from "@/lib/map.helpers";

interface PatheoMapProps {
  children?: ReactNode;
  cameraCenter?: [number, number];
  cameraZoom?: number;
  animated?: boolean;
  animationMs?: number;
  cameraBounds?: Bounds;
  cameraBoundsPadding?: number;
  onUserInteraction?: () => void;
  followMode?: boolean;
  followUserLocation?: [number, number] | null;
  followUserHeading?: number | null;
  followPitch?: number;
  followAnimationMs?: number;
  followZoom?: number;
}

export const PatheoMap = memo(function PatheoMap({
  children,
  cameraCenter = INITIAL_CENTER,
  cameraZoom = INITIAL_ZOOM,
  animated = false,
  animationMs,
  cameraBounds,
  cameraBoundsPadding,
  onUserInteraction,
  followMode = false,
  followUserLocation,
  followUserHeading,
  followPitch,
  followAnimationMs,
  followZoom,
}: PatheoMapProps) {
  const handleRegionWillChange = useCallback(
    (feature: Record<string, unknown>) => {
      const properties = feature?.properties as
        | { isUserInteraction?: boolean }
        | undefined;
      if (properties?.isUserInteraction) {
        onUserInteraction?.();
      }
    },
    [onUserInteraction],
  );

  return (
    <Map
      className="flex-1"
      mapStyle={MAP_STYLE}
      onRegionWillChange={handleRegionWillChange as never}
    >
      <MapCamera
        center={cameraCenter}
        zoom={cameraZoom}
        animated={animated}
        animationMs={animationMs}
        bounds={cameraBounds}
        boundsPadding={cameraBoundsPadding}
        followMode={followMode}
        followUserLocation={followUserLocation}
        followUserHeading={followUserHeading}
        followPitch={followPitch}
        followAnimationMs={followAnimationMs}
        followZoom={followZoom}
      />
      {children}
    </Map>
  );
});
