import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useLocationStore } from "@/store/location.store";
import { useUIStore } from "@/store/ui.store";
import type { NearbyStop } from "@/services/stops/stops.types";
import type { TripLocation } from "@/store/location.store";

function toTripLocation(stop: NearbyStop): TripLocation {
  return {
    latitude: stop.latitude,
    longitude: stop.longitude,
    name: stop.name,
    stopId: stop.id,
  };
}

export function useQuickRoute(
  targetStop: NearbyStop | null,
  nearbyStops: NearbyStop[] | undefined,
) {
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const hasPermission = useLocationStore((s) => s.hasPermission);
  const setOrigin = useLocationStore((s) => s.setOrigin);
  const setDestination = useLocationStore((s) => s.setDestination);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);
  const bottomSheetContent = useUIStore((s) => s.bottomSheetContent);

  const isRouting = bottomSheetContent === "routingResult";

  const routeToHere = useCallback(() => {
    if (!targetStop || !nearbyStops?.length) return;

    if (!hasPermission) {
      Alert.alert(
        "Location Required",
        "Enable location access in Settings to route from your current position.",
      );
      return;
    }

    if (!currentLocation) {
      Alert.alert(
        "Location Unavailable",
        "Waiting for your current position. Try again in a moment.",
      );
      return;
    }

    const sorted = [...nearbyStops].sort(
      (a, b) => a.distance_meters - b.distance_meters,
    );

    const originStop = sorted[0].id !== targetStop.id
      ? sorted[0]
      : sorted[1] ?? null;

    if (!originStop) {
      setDestination(toTripLocation(targetStop));
      setOrigin(null);
      setBottomSheet(1, "planner");
      return;
    }

    setOrigin(toTripLocation(originStop));
    setDestination(toTripLocation(targetStop));
    setBottomSheet(0, "routingResult");
  }, [
    targetStop,
    nearbyStops,
    hasPermission,
    currentLocation,
    setOrigin,
    setDestination,
    setBottomSheet,
  ]);

  const routeFromHere = useCallback(() => {
    if (!targetStop) return;

    setOrigin(toTripLocation(targetStop));
    setDestination(null);
    setBottomSheet(1, "planner");
  }, [targetStop, setOrigin, setDestination, setBottomSheet]);

  return useMemo(
    () => ({ routeToHere, routeFromHere, isRouting }),
    [routeToHere, routeFromHere, isRouting],
  );
}
