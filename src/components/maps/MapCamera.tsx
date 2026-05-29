import { useEffect, useRef } from "react";
import { Camera, type CameraRef } from "@maplibre/maplibre-react-native";
import { INITIAL_CENTER, INITIAL_ZOOM } from "@/constants/map";
import { CAMERA_FOLLOW_DURATION } from "@/constants/location";
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
  followMode?: boolean;
  followUserLocation?: [number, number] | null;
  followUserHeading?: number | null;
  followPitch?: number;
  followAnimationMs?: number;
  followZoom?: number;
  recenterTrigger?: number;
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
  followMode = false,
  followUserLocation,
  followUserHeading,
  followPitch = 0,
  followAnimationMs = CAMERA_FOLLOW_DURATION,
  followZoom,
  recenterTrigger,
}: MapCameraProps) {
  const cameraRef = useRef<CameraRef>(null);
  const isInitialMount = useRef(true);
  const lastCenterKeyRef = useRef<string | null>(null);
  const lastBoundsKeyRef = useRef<string | null>(null);
  const lastFollowKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (recenterTrigger !== undefined) {
      lastCenterKeyRef.current = null;
      lastFollowKeyRef.current = null;
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
  }, [center, zoom, heading, pitch, animated, animationMs, recenterTrigger]);

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

  useEffect(() => {
    if (!followMode || bounds || !followUserLocation) return;

    const [lng, lat] = followUserLocation;

    const headingPart =
      followUserHeading != null ? `${followUserHeading.toFixed(1)}` : "";
    const zoomPart = followZoom != null ? `${followZoom}` : "";
    const key = `${lng},${lat},${headingPart},${followPitch},${zoomPart}`;
    if (lastFollowKeyRef.current === key) return;
    lastFollowKeyRef.current = key;

    const options: Record<string, unknown> = {
      center: [lng, lat] as [number, number],
      duration: followAnimationMs,
    };

    if (followUserHeading != null) {
      options.bearing = followUserHeading;
    }

    if (followPitch !== 0) {
      options.pitch = followPitch;
    }

    if (followZoom != null) {
      options.zoom = followZoom;
    }

    cameraRef.current?.easeTo(options as never);
  }, [
    followMode,
    bounds,
    followUserLocation,
    followUserHeading,
    followPitch,
    followAnimationMs,
    followZoom,
  ]);

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
