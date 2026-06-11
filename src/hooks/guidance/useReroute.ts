import { useCallback } from "react";
import { useLocationStore } from "@/store/location.store";
import { useGuidanceStore } from "@/store/guidance.store";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { getNearbyStops } from "@/services/stops/stops.api";
import { notifyTripEnded } from "@/services/notifications";

export function useReroute() {
  const reroute = useCallback(async () => {
    const routeOption = useGuidanceStore.getState().routeOption;
    const destination = useLocationStore.getState().destination;
    const currentLocation = useLocationStore.getState().currentLocation;

    if (!currentLocation) return;

    const nearbyStops = await getNearbyStops(
      currentLocation.latitude,
      currentLocation.longitude,
      200,
      1,
    );

    if (!useGuidanceStore.getState().isActive) return;

    notifyTripEnded();
    useGuidanceStore.getState().endGuidance();
    useRouteStore.getState().clearSelection();

    if (!nearbyStops || nearbyStops.length === 0) {
      useLocationStore.getState().setOrigin({
        type: "currentLocation",
        name: "Current Location",
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
      useUIStore.getState().setBottomSheet("planner");
      return;
    }

    const nearest = nearbyStops[0];

    useGuidanceStore.getState().setRerouteWalkLine({
      from: [currentLocation.longitude, currentLocation.latitude],
      to: [nearest.longitude, nearest.latitude],
    });

    useLocationStore.getState().setOrigin({
      type: "stop",
      stopId: nearest.id,
      name: nearest.name,
      latitude: nearest.latitude,
      longitude: nearest.longitude,
    });

    if (!destination?.stopId && routeOption) {
      const lastLeg = routeOption.legs[routeOption.legs.length - 1];
      useLocationStore.getState().setDestination({
        type: "stop",
        stopId: lastLeg.toStopId,
        name: lastLeg.toStopName,
        latitude: 0,
        longitude: 0,
      });
    }

    useUIStore.getState().setBottomSheet("routingResult");
  }, []);

  return { reroute };
}
