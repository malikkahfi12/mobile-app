import { useEffect, useRef } from "react";
import { useGuidanceStore } from "@/store/guidance.store";
import { useLocationStore } from "@/store/location.store";
import {
  registerTripCategory,
  onTripAction,
  notifyTripStarted,
  notifyTripEnded,
  updateTripNotification,
} from "@/services/notifications";
import {
  getInstructionTitle,
  getInstructionSubtitle,
} from "@/lib/routing.helpers";

export function useTripNotification({ enabled }: { enabled: boolean }) {
  const routeOption = useGuidanceStore((s) => s.routeOption);
  const currentLegIndex = useGuidanceStore((s) => s.currentLegIndex);
  const prevLegIndex = useRef<number | null>(null);
  const wasActive = useRef(false);

  useEffect(() => {
    registerTripCategory();
    const subscription = onTripAction((action) => {
      const { isActive: active } = useGuidanceStore.getState();
      if (!active) {
        notifyTripEnded();
        return;
      }
      if (action === "end_trip") {
        useGuidanceStore.getState().endGuidance();
        notifyTripEnded();
      } else if (action === "next_step") {
        useGuidanceStore.getState().nextStep();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!enabled || !routeOption) {
      if (wasActive.current) {
        notifyTripEnded();
        wasActive.current = false;
        prevLegIndex.current = null;
      }
      return;
    }

    const destinationName =
      useLocationStore.getState().destination?.resolvedStopName ??
      useLocationStore.getState().destination?.name ??
      routeOption.legs[routeOption.legs.length - 1]?.toStopName ??
      "Destination";

    const isLastLeg = currentLegIndex >= routeOption.legs.length - 1;
    const currentLeg = routeOption.legs[currentLegIndex];
    if (!currentLeg) return;

    const instruction = getInstructionTitle(
      currentLeg,
      isLastLeg,
      destinationName,
    );
    const subtitle = getInstructionSubtitle(currentLeg, isLastLeg);

    const justStarted = !wasActive.current;
    const legChanged = prevLegIndex.current !== currentLegIndex;

    if (justStarted) {
      wasActive.current = true;
      prevLegIndex.current = currentLegIndex;
      notifyTripStarted(destinationName, instruction, subtitle);
    } else if (legChanged) {
      prevLegIndex.current = currentLegIndex;
      updateTripNotification(destinationName, instruction, subtitle);
    }
  }, [enabled, routeOption, currentLegIndex]);
}
