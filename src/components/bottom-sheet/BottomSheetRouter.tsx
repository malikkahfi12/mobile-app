import { useCallback, useEffect, useMemo, useRef, memo } from "react";
import { useRouting } from "@/hooks/api/useRouting";
import { useLocationStore } from "@/store/location.store";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { RouteOptionsSheet } from "./RouteOptionsSheet";
import { StopDetailSheet } from "./StopDetailSheet";
import { NearbyStopsSheet } from "./NearbyStopsSheet";
import { GuidanceSheet } from "./GuidanceSheet";
import { PlannerSheet } from "./PlannerSheet";
import { JourneyDetailSheet } from "./JourneyDetailSheet";
import { RouteDetailSheet } from "./RouteDetailSheet";
import type { NearbyStop } from "@/services/stops/stops.types";
import type { QuickPlace } from "@/types/quickPlaces.types";

interface BottomSheetRouterProps {
  nearbyStops: NearbyStop[] | undefined;
  stopsLoading: boolean;
  stopsError?: boolean;
  onRetryStops?: () => void;
  onAddPlace?: () => void;
  onEditPlace?: (place: QuickPlace) => void;
  onFocusCoordinate?: (lng: number, lat: number) => void;
  onDeletePlace?: (placeId: string) => void;
  onClearPlaces?: () => void;
}

export const BottomSheetRouter = memo(function BottomSheetRouter({
  nearbyStops,
  stopsLoading,
  stopsError,
  onRetryStops,
  onAddPlace,
  onEditPlace,
  onFocusCoordinate,
  onDeletePlace,
  onClearPlaces,
}: BottomSheetRouterProps) {
  const origin = useLocationStore((s) => s.origin);
  const destination = useLocationStore((s) => s.destination);
  const bottomSheetContent = useUIStore((s) => s.bottomSheetContent);
  const closeBottomSheet = useUIStore((s) => s.closeBottomSheet);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);
  const selectedStop = useRouteStore((s) => s.selectedStop);
  const setJourneyResult = useRouteStore((s) => s.setJourneyResult);
  const setSelectedRouteOptionIndex = useRouteStore(
    (s) => s.setSelectedRouteOptionIndex,
  );

  const isRoutingActive = bottomSheetContent === "routingResult";
  const isStopDetailActive = bottomSheetContent === "stopDetail";
  const isGuidanceActive = bottomSheetContent === "guidance";
  const isPlannerActive = bottomSheetContent === "planner";
  const isJourneyDetailActive = bottomSheetContent === "journeyDetail";
  const isRouteDetailActive = bottomSheetContent === "routeDetail";

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
    isRoutingActive || isGuidanceActive || isPlannerActive || isJourneyDetailActive;

  useEffect(() => {
    if (wasInRoutingRef.current && !inRoutingStates) {
      setJourneyResult(null);
      setSelectedRouteOptionIndex(null);
    }
    wasInRoutingRef.current = inRoutingStates;
  }, [inRoutingStates, setJourneyResult, setSelectedRouteOptionIndex]);

  useEffect(() => {
    if (!selectedStop && isStopDetailActive) {
      closeBottomSheet();
    }
  }, [selectedStop, isStopDetailActive, closeBottomSheet]);

  const handleViewDetails = useCallback(() => {
    setBottomSheet(0, "stopDetail");
  }, [setBottomSheet]);

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

  if (isGuidanceActive) {
    return <GuidanceSheet />;
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

  return (
    <NearbyStopsSheet
      stops={nearbyStops}
      isLoading={stopsLoading}
      isError={stopsError}
      onRetry={onRetryStops}
      onViewDetails={handleViewDetails}
      onAddPlace={onAddPlace}
      onEditPlace={onEditPlace}
      onFocusCoordinate={onFocusCoordinate}
      onDeletePlace={onDeletePlace}
      onClearPlaces={onClearPlaces}
    />
  );
});
