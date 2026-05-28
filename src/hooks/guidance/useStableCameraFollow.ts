import { useEffect, useMemo, useRef, useState } from "react";
import { haversineDistance, headingChanged } from "@/lib/location.helpers";
import type { Coordinates } from "@/services/location/location.types";
import {
  GUIDANCE_PITCH,
  CAMERA_FOLLOW_DURATION,
  CAMERA_SAFE_RADIUS_WALK,
  CAMERA_UPDATE_INTERVAL_WALK,
  CAMERA_MIN_HEADING_DELTA_WALK,
  CAMERA_MIN_SPEED_BEARING_WALK,
  GUIDANCE_ZOOM_WALK,
  CAMERA_DURATION_WALK,
  CAMERA_SAFE_RADIUS_TRANSIT,
  CAMERA_UPDATE_INTERVAL_TRANSIT,
  CAMERA_MIN_HEADING_DELTA_TRANSIT,
  CAMERA_MIN_SPEED_BEARING_TRANSIT,
  GUIDANCE_ZOOM_TRANSIT,
  CAMERA_DURATION_TRANSIT,
  CAMERA_SAFE_RADIUS_TRANSFER,
  CAMERA_UPDATE_INTERVAL_TRANSFER,
  CAMERA_MIN_HEADING_DELTA_TRANSFER,
  CAMERA_DURATION_TRANSFER,
} from "@/constants/location";
import { INITIAL_ZOOM } from "@/constants/map";

type GuidanceLegType = "walk" | "transit" | "transfer";

interface UseStableCameraFollowOptions {
  userLocation: Coordinates | null;
  userHeading: number | null;
  userSpeed: number | null;
  isActive: boolean;
  currentLegType: GuidanceLegType | null;
  currentLegIndex: number;
  guidancePhase: "fitting" | "following";
}

interface StableCameraResult {
  cameraCenter: [number, number] | null;
  cameraHeading: number | null;
  cameraZoom: number;
  cameraPitch: number;
  cameraAnimationMs: number;
}

function getSafeRadius(type: GuidanceLegType): number {
  if (type === "walk") return CAMERA_SAFE_RADIUS_WALK;
  if (type === "transit") return CAMERA_SAFE_RADIUS_TRANSIT;
  return CAMERA_SAFE_RADIUS_TRANSFER;
}

function getUpdateInterval(type: GuidanceLegType): number {
  if (type === "walk") return CAMERA_UPDATE_INTERVAL_WALK;
  if (type === "transit") return CAMERA_UPDATE_INTERVAL_TRANSIT;
  return CAMERA_UPDATE_INTERVAL_TRANSFER;
}

function getMinHeadingDelta(type: GuidanceLegType): number {
  if (type === "walk") return CAMERA_MIN_HEADING_DELTA_WALK;
  if (type === "transit") return CAMERA_MIN_HEADING_DELTA_TRANSIT;
  return CAMERA_MIN_HEADING_DELTA_TRANSFER;
}

function getMinSpeedBearing(type: GuidanceLegType): number {
  if (type === "walk") return CAMERA_MIN_SPEED_BEARING_WALK;
  return CAMERA_MIN_SPEED_BEARING_TRANSIT;
}

function getGuidanceZoom(type: GuidanceLegType): number {
  if (type === "walk") return GUIDANCE_ZOOM_WALK;
  if (type === "transit") return GUIDANCE_ZOOM_TRANSIT;
  return GUIDANCE_ZOOM_TRANSIT;
}

function getCameraDuration(type: GuidanceLegType): number {
  if (type === "walk") return CAMERA_DURATION_WALK;
  if (type === "transit") return CAMERA_DURATION_TRANSIT;
  return CAMERA_DURATION_TRANSFER;
}

export function useStableCameraFollow({
  userLocation,
  userHeading,
  userSpeed,
  isActive,
  currentLegType,
  currentLegIndex,
  guidancePhase,
}: UseStableCameraFollowOptions): StableCameraResult {
  const [stableCenter, setStableCenter] = useState<[number, number] | null>(
    null,
  );
  const [stableHeading, setStableHeading] = useState<number | null>(null);

  const lastCenter = useRef<{
    lat: number;
    lng: number;
    time: number;
  } | null>(null);
  const lastAppliedHeading = useRef<number | null>(null);
  const prevActive = useRef(false);
  const prevPhase = useRef<"fitting" | "following">("fitting");
  const prevLegIndex = useRef(currentLegIndex);

  const legType = currentLegType ?? "walk";

  const safeRadius = useMemo(() => getSafeRadius(legType), [legType]);
  const updateInterval = useMemo(() => getUpdateInterval(legType), [legType]);
  const minHeadingDelta = useMemo(() => getMinHeadingDelta(legType), [legType]);
  const minSpeedBearing = useMemo(
    () => getMinSpeedBearing(legType),
    [legType],
  );

  useEffect(() => {
    if (!isActive) {
      prevActive.current = false;
      return;
    }

    if (!userLocation) return;

    const newLng = userLocation.longitude;
    const newLat = userLocation.latitude;

    const justActivated = !prevActive.current;
    const phaseJustBecameFollowing =
      prevPhase.current !== "following" && guidancePhase === "following";
    const legChanged = prevLegIndex.current !== currentLegIndex;

    const needsImmediateUpdate =
      justActivated || phaseJustBecameFollowing || legChanged;

    prevActive.current = true;
    prevPhase.current = guidancePhase;
    prevLegIndex.current = currentLegIndex;

    if (needsImmediateUpdate) {
      lastCenter.current = { lat: newLat, lng: newLng, time: Date.now() };
      setStableCenter([newLng, newLat]);

      if (userHeading != null) {
        lastAppliedHeading.current = userHeading;
        setStableHeading(userHeading);
      } else {
        lastAppliedHeading.current = null;
        setStableHeading(null);
      }
      return;
    }

    const prev = lastCenter.current;
    const now = Date.now();

    if (!prev || now - prev.time >= updateInterval) {
      const shouldUpdateCenter =
        !prev ||
        haversineDistance(
          { latitude: prev.lat, longitude: prev.lng },
          { latitude: newLat, longitude: newLng },
        ) >= safeRadius;

      if (shouldUpdateCenter) {
        lastCenter.current = { lat: newLat, lng: newLng, time: now };
        setStableCenter([newLng, newLat]);
      }
    }

    if (userHeading === null) return;

    const suppressBearing =
      userSpeed != null && userSpeed < minSpeedBearing;

    if (suppressBearing) return;

    const prevHeading = lastAppliedHeading.current;

    if (
      prevHeading == null ||
      headingChanged(prevHeading, userHeading, minHeadingDelta)
    ) {
      lastAppliedHeading.current = userHeading;
      setStableHeading(userHeading);
    }
  }, [
    isActive,
    userLocation,
    userHeading,
    userSpeed,
    guidancePhase,
    currentLegIndex,
    safeRadius,
    updateInterval,
    minHeadingDelta,
    minSpeedBearing,
  ]);

  const cameraZoom = useMemo(
    () => (currentLegType ? getGuidanceZoom(currentLegType) : INITIAL_ZOOM),
    [currentLegType],
  );

  const cameraPitch = isActive ? GUIDANCE_PITCH : 0;

  const cameraAnimationMs = useMemo(
    () =>
      currentLegType ? getCameraDuration(currentLegType) : CAMERA_FOLLOW_DURATION,
    [currentLegType],
  );

  return useMemo(
    () => ({
      cameraCenter: stableCenter,
      cameraHeading: stableHeading,
      cameraZoom,
      cameraPitch,
      cameraAnimationMs,
    }),
    [stableCenter, stableHeading, cameraZoom, cameraPitch, cameraAnimationMs],
  );
}
