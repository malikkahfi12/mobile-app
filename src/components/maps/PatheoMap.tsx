import { type ReactNode, memo } from "react";
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
}

export const PatheoMap = memo(function PatheoMap({
  children,
  cameraCenter = INITIAL_CENTER,
  cameraZoom = INITIAL_ZOOM,
  animated = false,
  animationMs,
  cameraBounds,
  cameraBoundsPadding,
}: PatheoMapProps) {
  return (
    <Map className="flex-1" mapStyle={MAP_STYLE}>
      <MapCamera
        center={cameraCenter}
        zoom={cameraZoom}
        animated={animated}
        animationMs={animationMs}
        bounds={cameraBounds}
        boundsPadding={cameraBoundsPadding}
      />
      {children}
    </Map>
  );
});
