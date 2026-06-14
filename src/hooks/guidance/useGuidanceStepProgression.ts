import { useEffect, useRef } from "react";
import i18n from "@/lib/i18n";
import { useLocationStore } from "@/store/location.store";
import { useGuidanceStore } from "@/store/guidance.store";
import { haversineDistance } from "@/lib/location.helpers";
import { parseCoordinatePair } from "@/lib/map.helpers";
import type { Leg } from "@/services/routing/routing.types";
import {
  GUIDANCE_ARRIVAL_RADIUS,
  GUIDANCE_TRANSFER_RADIUS,
  GUIDANCE_DESTINATION_RADIUS,
  GUIDANCE_APPROACHING_RADIUS,
  GUIDANCE_AUTO_ADVANCE_MIN_INTERVAL,
  GUIDANCE_AUTO_ADVANCE_STABILITY,
  GUIDANCE_DEVIATION_DISTANCE,
  GUIDANCE_DEVIATION_STABILITY,
} from "@/constants/location";

interface UseGuidanceStepProgressionOptions {
  enabled: boolean;
}

function getLegEndCoordinate(leg: Leg): { lat: number; lng: number } | null {
  const toCoord = parseCoordinatePair(leg.toCoordinates);
  if (toCoord) return { lng: toCoord[0], lat: toCoord[1] };

  const geom = leg.geometry?.coordinates;
  if (geom && geom.length > 0) {
    const last = geom[geom.length - 1];
    if (Number.isFinite(last[0]) && Number.isFinite(last[1])) {
      return { lng: last[0], lat: last[1] };
    }
  }

  return null;
}

function getArrivalRadius(
  leg: Leg,
  isLastLeg: boolean,
  nextLeg: Leg | null,
): number {
  if (isLastLeg) return GUIDANCE_DESTINATION_RADIUS;
  if (leg.type === "TRANSIT" && nextLeg?.type === "TRANSIT" && leg.routeId !== nextLeg?.routeId)
    return GUIDANCE_TRANSFER_RADIUS;
  return GUIDANCE_ARRIVAL_RADIUS;
}

function getContextualMessage(
  leg: Leg,
  isLastLeg: boolean,
  nextLeg: Leg | null,
  isArrived: boolean,
  isApproaching: boolean,
): string | null {
  if (!isApproaching && !isArrived) return null;

  if (isArrived) {
    if (isLastLeg) return i18n.t("guidance.destinationReached");
    if (leg.type === "TRANSIT" && nextLeg?.type === "TRANSIT" && leg.routeId !== nextLeg?.routeId)
      return i18n.t("guidance.transferHereCaps");
    if (leg.type === "WALK") return i18n.t("guidance.boardNow");
    return null;
  }

  if (leg.type === "TRANSIT") return i18n.t("guidance.getOffSoon");

  return null;
}

function minDistanceToPolyline(
  user: { latitude: number; longitude: number },
  coords: [number, number][],
): number {
  if (coords.length === 0) return Infinity;

  let min = Infinity;
  for (const [lng, lat] of coords) {
    const d = haversineDistance(user, { latitude: lat, longitude: lng });
    if (d < min) min = d;
  }
  return min;
}

export function useGuidanceStepProgression({
  enabled,
}: UseGuidanceStepProgressionOptions) {
  const stabilityRef = useRef(0);
  const lastAdvanceRef = useRef(0);
  const autoAdvancingRef = useRef(false);
  const trackedLegIndexRef = useRef(0);
  const lastMessageRef = useRef<string | null>(null);
  const deviationCounterRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const guidanceState = useGuidanceStore.getState();
    trackedLegIndexRef.current = guidanceState.currentLegIndex;
    stabilityRef.current = 0;
    lastAdvanceRef.current = 0;
    autoAdvancingRef.current = false;
    lastMessageRef.current = null;

    const unsubLocation = useLocationStore.subscribe(() => {
      const locationState = useLocationStore.getState();
      const guidanceState = useGuidanceStore.getState();

      if (!guidanceState.isActive || !guidanceState.routeOption) return;

      const user = locationState.currentLocation;
      if (!user) return;

      const { routeOption, currentLegIndex } = guidanceState;
      const legs = routeOption.legs;
      const currentLeg = legs[currentLegIndex];
      if (!currentLeg) return;

      const isLastLeg = currentLegIndex >= legs.length - 1;
      const nextLeg = isLastLeg ? null : legs[currentLegIndex + 1];

      if (currentLegIndex !== trackedLegIndexRef.current) {
        stabilityRef.current = 0;
        lastAdvanceRef.current = 0;
        deviationCounterRef.current = 0;
        useGuidanceStore.getState().setDeviated(false);
        if (lastMessageRef.current !== null) {
          useGuidanceStore.getState().setContextualMessage(null);
          lastMessageRef.current = null;
        }
        trackedLegIndexRef.current = currentLegIndex;
        autoAdvancingRef.current = false;
      }

      if (currentLeg.type === "TRANSFER") {
        if (!isLastLeg) {
          const now = Date.now();
          if (now - lastAdvanceRef.current >= GUIDANCE_AUTO_ADVANCE_MIN_INTERVAL) {
            lastAdvanceRef.current = now;
            lastMessageRef.current = null;
            useGuidanceStore.getState().nextStep();
            trackedLegIndexRef.current = useGuidanceStore.getState().currentLegIndex;
          }
        }
        return;
      }

      const legEndCoords = getLegEndCoordinate(currentLeg);
      if (!legEndCoords) {
        if (!isLastLeg && nextLeg) {
          const nextStart = parseCoordinatePair(nextLeg.fromCoordinates);
          if (nextStart) {
            const distance = haversineDistance(
              { latitude: user.latitude, longitude: user.longitude },
              { latitude: nextStart[1], longitude: nextStart[0] },
            );
            if (distance <= GUIDANCE_APPROACHING_RADIUS) {
              stabilityRef.current += 1;
              if (
                stabilityRef.current >= GUIDANCE_AUTO_ADVANCE_STABILITY &&
                Date.now() - lastAdvanceRef.current >= GUIDANCE_AUTO_ADVANCE_MIN_INTERVAL
              ) {
                lastAdvanceRef.current = Date.now();
                stabilityRef.current = 0;
                lastMessageRef.current = null;
                useGuidanceStore.getState().nextStep();
                trackedLegIndexRef.current = useGuidanceStore.getState().currentLegIndex;
              }
            } else {
              stabilityRef.current = 0;
            }
          }
        }
        return;
      }

      const distance = haversineDistance(
        { latitude: user.latitude, longitude: user.longitude },
        { latitude: legEndCoords.lat, longitude: legEndCoords.lng },
      );

      const arrivalRadius = getArrivalRadius(currentLeg, isLastLeg, nextLeg);
      const isArrived = distance <= arrivalRadius;
      const isApproaching = distance <= GUIDANCE_APPROACHING_RADIUS;

      const message = getContextualMessage(
        currentLeg,
        isLastLeg,
        nextLeg,
        isArrived,
        isApproaching,
      );

      if (message !== lastMessageRef.current) {
        lastMessageRef.current = message;
        useGuidanceStore.getState().setContextualMessage(message);
      }

      if (isArrived && !isLastLeg) {
        stabilityRef.current += 1;

        const now = Date.now();
        if (
          stabilityRef.current >= GUIDANCE_AUTO_ADVANCE_STABILITY &&
          now - lastAdvanceRef.current >= GUIDANCE_AUTO_ADVANCE_MIN_INTERVAL
        ) {
          autoAdvancingRef.current = true;
          lastAdvanceRef.current = now;
          stabilityRef.current = 0;
          lastMessageRef.current = null;

          useGuidanceStore.getState().nextStep();

          trackedLegIndexRef.current =
            useGuidanceStore.getState().currentLegIndex;
          autoAdvancingRef.current = false;
        }
      } else {
        stabilityRef.current = 0;
      }

      if (
        currentLeg.type === "TRANSIT" &&
        currentLeg.geometry?.coordinates
      ) {
        const deviationDist = minDistanceToPolyline(
          { latitude: user.latitude, longitude: user.longitude },
          currentLeg.geometry.coordinates,
        );

        if (deviationDist > GUIDANCE_DEVIATION_DISTANCE) {
          deviationCounterRef.current += 1;
          if (
            deviationCounterRef.current >= GUIDANCE_DEVIATION_STABILITY
          ) {
            deviationCounterRef.current = 0;
            useGuidanceStore.getState().setDeviated(true);
          }
        } else {
          deviationCounterRef.current = 0;
          if (useGuidanceStore.getState().isDeviated) {
            useGuidanceStore.getState().setDeviated(false);
          }
        }
      }
    });

    const unsubGuidance = useGuidanceStore.subscribe(() => {
      const { isActive } = useGuidanceStore.getState();
      if (!isActive) {
        stabilityRef.current = 0;
        lastAdvanceRef.current = 0;
        autoAdvancingRef.current = false;
        lastMessageRef.current = null;
        deviationCounterRef.current = 0;
      }
    });

    return () => {
      unsubLocation();
      unsubGuidance();
    };
  }, [enabled]);
}
