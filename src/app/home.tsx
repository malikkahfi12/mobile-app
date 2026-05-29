import { BottomSheetRouter } from "@/components/bottom-sheet/BottomSheetRouter";
import { SearchBarOverlay } from "@/components/home/SearchBarOverlay";
import { PatheoMap } from "@/components/maps/PatheoMap";
import { PlaceMarker } from "@/components/maps/PlaceMarker";
import { RecenterButton } from "@/components/maps/RecenterButton";
import { RouteEndpointMarker } from "@/components/maps/RouteEndpointMarker";
import { RoutePolyline } from "@/components/maps/RoutePolyline";
import { StopMarker } from "@/components/maps/StopMarker";
import { TransferStopMarker } from "@/components/maps/TransferStopMarker";
import { UserLocationMarker } from "@/components/maps/UserLocationMarker";
import { QuickPlaceSheet } from "@/components/quick-places/QuickPlaceSheet";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { colors } from "@/constants/colors";
import {
  CAMERA_FOLLOW_DURATION,
  GUIDANCE_LEG_FIT_DURATION,
} from "@/constants/location";
import { INITIAL_CENTER, ZOOM } from "@/constants/map";
import { useGuidanceStepProgression } from "@/hooks/guidance/useGuidanceStepProgression";
import { useStableCameraFollow } from "@/hooks/guidance/useStableCameraFollow";
import { useCurrentLocation } from "@/hooks/location/useCurrentLocation";
import { useLocationPermission } from "@/hooks/location/useLocationPermission";
import { useLocationWatcher } from "@/hooks/location/useLocationWatcher";
import { useTripNotification } from "@/hooks/useTripNotification";
import { useNearbyStops } from "@/hooks/stops/useNearbyStops";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { computeBounds, getLegBounds } from "@/lib/map.helpers";
import { getRouteCoordinates } from "@/lib/routing.helpers";
import { getLastKnownPosition } from "@/services/location/location.service";
import type { NearbyStop } from "@/services/stops/stops.types";
import { useGuidanceStore } from "@/store/guidance.store";
import { useLocationStore } from "@/store/location.store";
import { useQuickPlacesStore } from "@/store/quickPlaces.store";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import type { QuickPlace } from "@/types/quickPlaces.types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { status, isGranted, request } = useLocationPermission();
  const { fetchLocation } = useCurrentLocation();
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const origin = useLocationStore((s) => s.origin);
  const destination = useLocationStore((s) => s.destination);
  const storeError = useLocationStore((s) => s.locationError);
  const setCurrentLocation = useLocationStore((s) => s.setCurrentLocation);
  const insets = useSafeAreaInsets();

  const { data: nearbyStops, isLoading: stopsLoading, isError: stopsError, refetch: refetchStops } =
    useNearbyStops();
  const selectedStop = useRouteStore((s) => s.selectedStop);
  const setSelectedStop = useRouteStore((s) => s.setSelectedStop);
  const journeyResult = useRouteStore((s) => s.journeyResult);
  const selectedRouteOptionIndex = useRouteStore(
    (s) => s.selectedRouteOptionIndex,
  );
  const bottomSheetContent = useUIStore((s) => s.bottomSheetContent);
  const guidanceActive = useGuidanceStore((s) => s.isActive);
  const guidanceLegIndex = useGuidanceStore((s) => s.currentLegIndex);
  const isRoutingActive =
    bottomSheetContent === "routingResult" ||
    bottomSheetContent === "guidance" ||
    bottomSheetContent === "planner" ||
    bottomSheetContent === "journeyDetail";

  useLocationWatcher({ enabled: isGranted, guidanceMode: guidanceActive });
  useGuidanceStepProgression({ enabled: guidanceActive });
  useTripNotification({ enabled: guidanceActive });

  const [cameraCenter, setCameraCenter] =
    useState<[number, number]>(INITIAL_CENTER);
  const [followMode, setFollowMode] = useState(false);
  const [recenterError, setRecenterError] = useState(false);
  const [locationInitialized, setLocationInitialized] = useState(false);
  const [isRecenterLoading, setIsRecenterLoading] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [guidanceBoundsPhase, setGuidanceBoundsPhase] = useState<
    "fitting" | "following"
  >("fitting");
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guidanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const didInitialFit = useRef(false);

  const userHeading = useLocationStore((s) => s.heading);
  const userLocation = useLocationStore((s) => s.currentLocation);
  const userSpeed = useLocationStore((s) => s.speed);

  const handleUserInteraction = useCallback(() => {
    setFollowMode(false);
  }, []);

  const selectedOption = useMemo(() => {
    if (!journeyResult || selectedRouteOptionIndex == null) return null;
    return journeyResult.options[selectedRouteOptionIndex] ?? null;
  }, [journeyResult, selectedRouteOptionIndex]);

  const routeCoords = useMemo(
    () => (selectedOption ? getRouteCoordinates(selectedOption) : []),
    [selectedOption],
  );

  const [quickPlaceModal, setQuickPlaceModal] = useState<{
    visible: boolean;
    place?: QuickPlace;
  }>({ visible: false });
  const addPlace = useQuickPlacesStore((s) => s.addPlace);
  const updatePlace = useQuickPlacesStore((s) => s.updatePlace);
  const removePlace = useQuickPlacesStore((s) => s.removePlace);

  const handleOpenAddPlace = useCallback(() => {
    setQuickPlaceModal({ visible: true });
  }, []);

  const handleOpenEditPlace = useCallback((place: QuickPlace) => {
    setQuickPlaceModal({ visible: true, place });
  }, []);

  const handleClosePlaceModal = useCallback(() => {
    setQuickPlaceModal({ visible: false });
  }, []);

  const handleSavePlace = useCallback(
    (
      data:
        | QuickPlace
        | Omit<QuickPlace, "id" | "createdAt" | "updatedAt">,
    ) => {
      if ("id" in data && data.name === "") {
        removePlace(data.id);
        setSelectedStop(null);
      } else if ("id" in data) {
        updatePlace(data.id, data);
      } else {
        addPlace(data);
      }
    },
    [addPlace, updatePlace, removePlace, setSelectedStop],
  );

  const handleFocusCoordinate = useCallback(
    (lng: number, lat: number) => {
      setCameraCenter([lng, lat]);
      setSelectedStop(null);
    },
    [setSelectedStop],
  );

  const handleDeletePlace = useCallback(
    (placeId: string) => {
      removePlace(placeId);
    },
    [removePlace],
  );

  const handleClearPlaces = useCallback(() => {
    const places = useQuickPlacesStore.getState().places;
    for (const p of places) {
      removePlace(p.id);
    }
  }, [removePlace]);

  useEffect(() => {
    if (status === "undetermined") {
      request();
    }
  }, [status, request]);

  useEffect(() => {
    const init = async () => {
      if (!isGranted || locationInitialized) return;
      setLocationInitialized(true);

      const lastKnown = await getLastKnownPosition();
      if (lastKnown) {
        setCurrentLocation(
          lastKnown.latitude,
          lastKnown.longitude,
          lastKnown.accuracy,
        );
        setCameraCenter([lastKnown.longitude, lastKnown.latitude]);
      }

      const fresh = await fetchLocation();
      if (fresh) {
        setCameraCenter([fresh.longitude, fresh.latitude]);
      } else if (!lastKnown) {
        setCurrentLocation(
          INITIAL_CENTER[1],
          INITIAL_CENTER[0],
          0,
        );
      }
    };

    init();
  }, [isGranted, locationInitialized, fetchLocation, setCurrentLocation]);

  useEffect(() => {
    if (selectedStop) {
      setCameraCenter([
        selectedStop.longitude,
        selectedStop.latitude,
      ]);
    }
  }, [selectedStop]);

  const handleRecenter = useCallback(async () => {
    setRecenterTrigger((t) => t + 1);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    const lastKnown = await getLastKnownPosition();
    if (lastKnown) {
      setRecenterError(false);
      setCameraCenter([lastKnown.longitude, lastKnown.latitude]);
      setCurrentLocation(
        lastKnown.latitude,
        lastKnown.longitude,
        lastKnown.accuracy,
      );
      setFollowMode(true);
    }

    setIsRecenterLoading(true);
    const fresh = await fetchLocation();
    setIsRecenterLoading(false);

    if (fresh) {
      setRecenterError(false);
      setCameraCenter([fresh.longitude, fresh.latitude]);
      setFollowMode(true);
    } else if (!lastKnown) {
      Vibration.vibrate(100);
      setRecenterError(true);
      errorTimeoutRef.current = setTimeout(() => {
        setRecenterError(false);
      }, 2500);
    }
  }, [fetchLocation, setCurrentLocation]);

  const handleStopPress = useCallback(
    (stop: NearbyStop) => {
      setSelectedStop(stop.id === selectedStop?.id ? null : stop);
    },
    [selectedStop, setSelectedStop],
  );

  const showPermissionBanner = useMemo(
    () => status === "denied" || (!isGranted && locationInitialized),
    [status, isGranted, locationInitialized],
  );

  const isRouteActive = selectedOption !== null && routeCoords.length > 0;

  const currentGuidanceLegType: "walk" | "transit" | "transfer" | null =
    useMemo(() => {
      if (!guidanceActive || !selectedOption) return null;
      const leg = selectedOption.legs[guidanceLegIndex];
      if (!leg) return null;
      if (leg.type === "WALK") return "walk";
      const nextLeg = selectedOption.legs[guidanceLegIndex + 1];
      return nextLeg?.type === "TRANSIT" ? "transfer" : "transit";
    }, [guidanceActive, selectedOption, guidanceLegIndex]);

  const stableCamera = useStableCameraFollow({
    userLocation,
    userHeading,
    userSpeed,
    isActive: guidanceActive,
    currentLegType: currentGuidanceLegType,
    currentLegIndex: guidanceLegIndex,
    guidancePhase: guidanceBoundsPhase,
  });

  const followUserLocation: [number, number] | null = guidanceActive
    ? stableCamera.cameraCenter
    : userLocation
      ? ([userLocation.longitude, userLocation.latitude] as [number, number])
      : null;

  const followUserHeading = guidanceActive
    ? stableCamera.cameraHeading
    : null;

  const followPitch = guidanceActive
    ? stableCamera.cameraPitch
    : 0;

  const followAnimationMs = guidanceActive
    ? stableCamera.cameraAnimationMs
    : CAMERA_FOLLOW_DURATION;

  const followZoom = guidanceActive ? stableCamera.cameraZoom : undefined;

  const effectiveFollowMode =
    followMode && !selectedStop && (!isRouteActive || guidanceActive);

  const isSelectedStopInNearby = useMemo(
    () => nearbyStops?.some((s) => s.id === selectedStop?.id) ?? false,
    [nearbyStops, selectedStop],
  );

  const routeBounds = useMemo(() => {
    if (!isRouteActive || routeCoords.length === 0) return undefined;
    return computeBounds(routeCoords) ?? undefined;
  }, [isRouteActive, routeCoords]);

  const guidanceBounds = useMemo(() => {
    if (!guidanceActive || !selectedOption) return undefined;
    const leg = selectedOption.legs[guidanceLegIndex];
    return leg ? (getLegBounds(leg) ?? undefined) : undefined;
  }, [guidanceActive, selectedOption, guidanceLegIndex]);

  const guidancePadding = useMemo(() => {
    if (!guidanceActive || !selectedOption) return undefined;
    const leg = selectedOption.legs[guidanceLegIndex];
    return leg?.type === "WALK" ? 80 : 120;
  }, [guidanceActive, selectedOption, guidanceLegIndex]);

  const cameraZoom = useMemo(() => {
    if (selectedStop) return ZOOM.street;
    if (guidanceActive) return stableCamera.cameraZoom;
    return ZOOM.city;
  }, [selectedStop, guidanceActive, stableCamera.cameraZoom]);

  useEffect(() => {
    if (!guidanceActive) {
      didInitialFit.current = false;
      setGuidanceBoundsPhase("fitting");
      return;
    }

    if (!didInitialFit.current) {
      didInitialFit.current = true;
      setGuidanceBoundsPhase("fitting");
      setFollowMode(true);

      if (guidanceTimeoutRef.current) {
        clearTimeout(guidanceTimeoutRef.current);
      }

      guidanceTimeoutRef.current = setTimeout(() => {
        setGuidanceBoundsPhase("following");
      }, GUIDANCE_LEG_FIT_DURATION);

      return () => {
        if (guidanceTimeoutRef.current) {
          clearTimeout(guidanceTimeoutRef.current);
        }
      };
    }

    setGuidanceBoundsPhase("following");
    setFollowMode(true);
  }, [guidanceActive, guidanceLegIndex]);

  const showRouteBounds = isRouteActive && !guidanceActive;
  const showGuidanceBounds =
    guidanceActive && guidanceBoundsPhase === "fitting";
  const effectiveCameraBounds = showRouteBounds
    ? routeBounds
    : showGuidanceBounds
      ? guidanceBounds
      : undefined;

  useNetworkStatus();

  return (
    <>
      <ErrorBoundary>
      <View className="flex-1">
        <OfflineBanner />
      <PatheoMap
        cameraCenter={cameraCenter}
        cameraZoom={cameraZoom}
        cameraBounds={effectiveCameraBounds}
        cameraBoundsPadding={guidanceActive ? guidancePadding : 80}
        animated={selectedStop !== null || isRouteActive || guidanceActive}
        animationMs={guidanceActive ? GUIDANCE_LEG_FIT_DURATION : undefined}
        onUserInteraction={handleUserInteraction}
        followMode={effectiveFollowMode}
        followUserLocation={followUserLocation}
        followUserHeading={followUserHeading}
        followPitch={followPitch}
        followAnimationMs={followAnimationMs}
        followZoom={followZoom}
        recenterTrigger={recenterTrigger}
      >
        {isGranted && <UserLocationMarker />}
        {nearbyStops?.map((stop) => (
          <StopMarker
            key={stop.id}
            stop={stop}
            isSelected={selectedStop?.id === stop.id}
            onPress={handleStopPress}
          />
        ))}
        {selectedStop &&
          !isSelectedStopInNearby && (
            <StopMarker
              key={`selected-${selectedStop.id}`}
              stop={selectedStop}
              isSelected={true}
              onPress={handleStopPress}
            />
          )}
        {origin?.type === "place" && (
          <PlaceMarker
            id="origin-place"
            coordinate={[origin.longitude, origin.latitude]}
          />
        )}
        {destination?.type === "place" && (
          <PlaceMarker
            id="dest-place"
            coordinate={[destination.longitude, destination.latitude]}
          />
        )}
        {selectedOption && (
          <>
            <RoutePolyline
              legs={selectedOption.legs}
              activeLegIndex={guidanceActive ? guidanceLegIndex : undefined}
            />
            <TransferStopMarker legs={selectedOption.legs} />
            <RouteEndpointMarker option={selectedOption} />
          </>
        )}
      </PatheoMap>

      {stopsLoading && currentLocation && (
        <View
          className="absolute left-4 flex-row items-center rounded-full bg-white/90 px-3 py-1.5"
          style={{ top: insets.top + 12 }}
        >
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className="ml-2 text-xs text-gray-500">Finding stops...</Text>
        </View>
      )}

      {!stopsLoading && isGranted && !storeError && !isRoutingActive && (
        <SearchBarOverlay />
      )}

      {stopsError && !stopsLoading && (
        <TouchableOpacity
          className="absolute bottom-28 left-4 right-4 rounded-lg bg-red-50 px-4 py-3"
          style={{ bottom: insets.top > 0 ? insets.top + 96 : 96 }}
          onPress={() => refetchStops()}
          activeOpacity={0.7}
        >
          <Text className="text-sm text-red-600">
            Failed to load nearby stops. Tap to retry.
          </Text>
        </TouchableOpacity>
      )}

      {showPermissionBanner && (
        <View
          className="absolute left-4 right-4 rounded-lg bg-white/90 px-4 py-3"
          style={{ top: insets.top + 12 }}
        >
          <Text className="text-sm text-gray-700">
            Location permission needed to find nearby stops. Enable in Settings.
          </Text>
        </View>
      )}

      {storeError && !showPermissionBanner && (
        <View className="absolute bottom-28 left-4 right-4 rounded-lg bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-600">{storeError}</Text>
        </View>
      )}

      <RecenterButton
        onPress={handleRecenter}
        isLoading={isRecenterLoading}
        hasError={recenterError}
        isFollowing={effectiveFollowMode}
      />

      <BottomSheetRouter
        nearbyStops={nearbyStops}
        stopsLoading={stopsLoading}
        stopsError={stopsError}
        onRetryStops={refetchStops}
        onAddPlace={handleOpenAddPlace}
        onEditPlace={handleOpenEditPlace}
        onFocusCoordinate={handleFocusCoordinate}
        onDeletePlace={handleDeletePlace}
        onClearPlaces={handleClearPlaces}
      />
    </View>
    </ErrorBoundary>

      <QuickPlaceSheet
        visible={quickPlaceModal.visible}
        place={quickPlaceModal.place}
        nearbyStops={nearbyStops}
        onSave={handleSavePlace}
        onClose={handleClosePlaceModal}
      />
    </>
  );
}
