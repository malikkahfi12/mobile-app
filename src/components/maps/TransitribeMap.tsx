import { type ReactNode, memo, useCallback } from "react";
import { Map, type ViewPadding } from "@maplibre/maplibre-react-native";
import { MapCamera } from "./MapCamera";
import { MAP_STYLE, INITIAL_CENTER, INITIAL_ZOOM } from "@/constants/map";
import type { Bounds } from "@/lib/map.helpers";

interface TransitribeMapProps {
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
  recenterTrigger?: number;
  contentInset?: ViewPadding;
}

export const TransitribeMap = memo(function TransitribeMap({
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
  recenterTrigger,
  contentInset,
}: TransitribeMapProps) {
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
      androidView="texture"
      mapStyle={MAP_STYLE}
      contentInset={contentInset}
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
        recenterTrigger={recenterTrigger}
      />
      {children}
    </Map>
  );
});
