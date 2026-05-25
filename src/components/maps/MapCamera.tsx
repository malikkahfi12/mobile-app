import { useEffect, useRef } from "react";
import { Camera, type CameraRef } from "@maplibre/maplibre-react-native";
import { INITIAL_CENTER, INITIAL_ZOOM } from "@/constants/map";
import type { Bounds } from "@/lib/map.helpers";

export type { CameraRef };

interface MapCameraProps {
  center?: [number, number];
  zoom?: number;
  heading?: number;
  pitch?: number;
  animated?: boolean;
  animationMs?: number;
  bounds?: Bounds;
  boundsPadding?: number;
}

export function MapCamera({
  center = INITIAL_CENTER,
  zoom = INITIAL_ZOOM,
  heading,
  pitch,
  animated = false,
  animationMs = 500,
  bounds,
  boundsPadding = 80,
}: MapCameraProps) {
  const cameraRef = useRef<CameraRef>(null);
  const isInitialMount = useRef(true);
  const lastCenterKeyRef = useRef<string | null>(null);
  const lastBoundsKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const key = `${center[0]},${center[1]},${zoom}`;
    if (lastCenterKeyRef.current === key) return;
    lastCenterKeyRef.current = key;

    const options = {
      center,
      zoom,
      ...(heading !== undefined && { bearing: heading }),
      ...(pitch !== undefined && { pitch }),
    };

    if (animated) {
      cameraRef.current?.easeTo({ ...options, duration: animationMs });
    } else {
      cameraRef.current?.jumpTo(options);
    }
  }, [center, zoom, heading, pitch, animated, animationMs]);

  useEffect(() => {
    if (!bounds) return;

    const key = `${bounds.sw[0]},${bounds.sw[1]},${bounds.ne[0]},${bounds.ne[1]},${boundsPadding}`;
    if (lastBoundsKeyRef.current === key) return;
    lastBoundsKeyRef.current = key;

    const padding = {
      top: boundsPadding,
      right: boundsPadding,
      bottom: boundsPadding,
      left: boundsPadding,
    };

    if (animated) {
      cameraRef.current?.fitBounds(
        [bounds.sw[0], bounds.sw[1], bounds.ne[0], bounds.ne[1]],
        { padding, duration: animationMs },
      );
    } else {
      cameraRef.current?.fitBounds(
        [bounds.sw[0], bounds.sw[1], bounds.ne[0], bounds.ne[1]],
        { padding },
      );
    }
  }, [bounds, boundsPadding, animated, animationMs]);

  return (
    <Camera
      ref={cameraRef}
      center={center}
      zoom={zoom}
      {...(heading !== undefined && { bearing: heading })}
      {...(pitch !== undefined && { pitch })}
    />
  );
}

export type { MapCameraProps };
