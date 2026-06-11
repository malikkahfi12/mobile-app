import { useEffect, useMemo, useRef, memo } from "react";
import { useRouting } from "@/hooks/api/useRouting";
import { useGuidanceStore } from "@/store/guidance.store";
import { useLocationStore } from "@/store/location.store";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { RouteOptionsSheet } from "./RouteOptionsSheet";
import { StopDetailSheet } from "./StopDetailSheet";
import { NearbyStopsSheet } from "./NearbyStopsSheet";
import { PlannerSheet } from "./PlannerSheet";
import { JourneyDetailSheet } from "./JourneyDetailSheet";
import { RouteDetailSheet } from "./RouteDetailSheet";
import { BusPickerSheet } from "@/components/guidance/BusPickerSheet";
import type { NearbyStop } from "@/services/stops/stops.types";

interface BottomSheetRouterProps {
  nearbyStops: NearbyStop[] | undefined;
  stopsLoading: boolean;
  stopsError?: boolean;
  onRetryStops?: () => void;
}

export const BottomSheetRouter = memo(function BottomSheetRouter({
  nearbyStops,
  stopsLoading,
  stopsError,
  onRetryStops,
}: BottomSheetRouterProps) {
  const origin = useLocationStore((s) => s.origin);
  const destination = useLocationStore((s) => s.destination);
  const bottomSheetContent = useUIStore((s) => s.bottomSheetContent);
  const closeBottomSheet = useUIStore((s) => s.closeBottomSheet);
  const setJourneyResult = useRouteStore((s) => s.setJourneyResult);
  const setSelectedRouteOptionIndex = useRouteStore(
    (s) => s.setSelectedRouteOptionIndex,
  );

  const isRoutingActive = bottomSheetContent === "routingResult";
  const isStopDetailActive = bottomSheetContent === "stopDetail";
  const isGuidanceActive = useGuidanceStore((s) => s.isActive);
  const isPlannerActive = bottomSheetContent === "planner";
  const isJourneyDetailActive = bottomSheetContent === "journeyDetail";
  const isRouteDetailActive = bottomSheetContent === "routeDetail";
  const isBusPickerActive = bottomSheetContent === "busPicker";

  const routingParams = useMemo(() => {
    if (!isRoutingActive || !origin?.stopId || !destination?.stopId)
      return null;
    return { fromStopId: origin.stopId, toStopId: destination.stopId };
  }, [isRoutingActive, origin, destination]);

  const {
    data: routingResult,
    isLoading: routingLoading,
    isError: routingError,
    error: routingErr,
    dataUpdatedAt: routingUpdatedAt,
    refetch: retryRouting,
  } = useRouting(routingParams);

  const wasInRoutingRef = useRef(false);
  const inRoutingStates =
    isRoutingActive || isGuidanceActive || isPlannerActive || isJourneyDetailActive || isBusPickerActive;

  useEffect(() => {
    if (wasInRoutingRef.current && !inRoutingStates) {
      setJourneyResult(null);
      setSelectedRouteOptionIndex(null);
    }
    wasInRoutingRef.current = inRoutingStates;
  }, [inRoutingStates, setJourneyResult, setSelectedRouteOptionIndex]);

  useEffect(() => {
    return useRouteStore.subscribe((state, prev) => {
      if (!state.selectedStop && prev.selectedStop) {
        useUIStore.getState().closeBottomSheet();
      }
    });
  }, []);

  if (isRoutingActive) {
    return (
      <RouteOptionsSheet
        result={routingResult}
        isLoading={routingLoading}
        isError={routingError}
        errorMessage={
          routingErr instanceof Error ? routingErr.message : undefined
        }
        originName={origin?.name}
        destinationName={destination?.name}
        dataUpdatedAt={routingUpdatedAt}
        onRetry={() => retryRouting()}
        onClose={closeBottomSheet}
      />
    );
  }

  if (isStopDetailActive) {
    return <StopDetailSheet />;
  }

  if (isPlannerActive) {
    return <PlannerSheet />;
  }

  if (isJourneyDetailActive) {
    return <JourneyDetailSheet />;
  }

  if (isRouteDetailActive) {
    return <RouteDetailSheet />;
  }

  if (isBusPickerActive) {
    return <BusPickerSheet />;
  }

  if (isGuidanceActive) {
    return null;
  }

  return (
    <NearbyStopsSheet
      stops={nearbyStops}
      isLoading={stopsLoading}
      isError={stopsError}
      onRetry={onRetryStops}
    />
  );
});
