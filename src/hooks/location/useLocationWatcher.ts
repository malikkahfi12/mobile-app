import { useEffect, useRef } from "react";
import { useLocationStore } from "@/store/location.store";
import {
  startLocationWatch,
  stopLocationWatch,
} from "@/services/location/location.service";
import type { LocationSubscription } from "expo-location";
import {
  shouldUpdateLocation,
  smoothHeading,
} from "@/lib/location.helpers";
import {
  MIN_MOVEMENT_DISTANCE,
  MIN_MOVEMENT_DISTANCE_GUIDANCE,
  HEADING_SMOOTHING_FACTOR,
  MAX_ACCEPTED_ACCURACY,
  HEADING_ENABLE_ACCURACY,
} from "@/constants/location";
import type { Coordinates } from "@/services/location/location.types";

interface UseLocationWatcherOptions {
  enabled: boolean;
  guidanceMode: boolean;
}

export function useLocationWatcher({
  enabled,
  guidanceMode,
}: UseLocationWatcherOptions) {
  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const lastLocationRef = useRef<Coordinates | null>(null);
  const lastHeadingRef = useRef<number | null>(null);
  const setFullLocation = useLocationStore((s) => s.setFullLocation);
  const setWatching = useLocationStore((s) => s.setWatching);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const start = async () => {
      subscriptionRef.current = await startLocationWatch(
        { guidanceMode },
        (location) => {
          if (cancelled) return;

          const minDistance = guidanceMode
            ? MIN_MOVEMENT_DISTANCE_GUIDANCE
            : MIN_MOVEMENT_DISTANCE;

          const shouldUpdate = shouldUpdateLocation(
            lastLocationRef.current,
            location,
            minDistance,
            MAX_ACCEPTED_ACCURACY,
            location.accuracy,
          );

          if (!shouldUpdate) return;

          lastLocationRef.current = {
            latitude: location.latitude,
            longitude: location.longitude,
          };

          let smoothedHeading: number | null = null;
          if (location.heading != null && location.accuracy != null && location.accuracy <= HEADING_ENABLE_ACCURACY) {
            smoothedHeading = smoothHeading(
              lastHeadingRef.current,
              location.heading,
              HEADING_SMOOTHING_FACTOR,
            );
            lastHeadingRef.current = smoothedHeading;
          }

          setFullLocation(
            location.latitude,
            location.longitude,
            location.accuracy,
            smoothedHeading,
            location.speed,
            location.altitude,
            location.timestamp,
          );
        },
      );

      if (!cancelled) {
        setWatching(true);
      }
    };

    setWatching(true);
    start();

    return () => {
      cancelled = true;
      setWatching(false);
      if (subscriptionRef.current) {
        stopLocationWatch(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [enabled, guidanceMode, setFullLocation, setWatching]);
}
