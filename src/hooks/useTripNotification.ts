import { useEffect, useMemo, useRef } from "react";
import i18n from "@/lib/i18n";
import { useGuidanceStore } from "@/store/guidance.store";
import { useLocationStore } from "@/store/location.store";
import { useUIStore } from "@/store/ui.store";
import { useRouteStore } from "@/store/route.store";
import {
  registerTripCategory,
  onTripAction,
  notifyTripStarted,
  notifyTripEnded,
  updateTripNotification,
  notifyContextualEvent,
  dismissContextualNotification,
} from "@/services/notifications";
import {
  getInstructionTitle,
  getInstructionSubtitle,
} from "@/lib/routing.helpers";

const MIN_CONTEXTUAL_INTERVAL = 30_000;

export function useTripNotification({ enabled }: { enabled: boolean }) {
  const routeOption = useGuidanceStore((s) => s.routeOption);
  const currentLegIndex = useGuidanceStore((s) => s.currentLegIndex);
  const contextualMessage = useGuidanceStore((s) => s.contextualMessage);
  const prevLegIndex = useRef<number | null>(null);
  const wasActive = useRef(false);
  const lastNotifiedMessage = useRef<string | null>(null);
  const lastNotifiedTime = useRef(0);

  const messagesToNotify = useMemo(() => [
    i18n.t("guidance.getOffSoon"),
    i18n.t("guidance.transferHereCaps"),
    i18n.t("guidance.boardNow"),
    i18n.t("guidance.destinationReached"),
  ], []);

  useEffect(() => {
    registerTripCategory();
    const subscription = onTripAction((action) => {
      const { isActive: active } = useGuidanceStore.getState();
      if (!active) {
        notifyTripEnded();
        return;
      }
      if (action === "end_trip") {
        useUIStore.getState().closeBottomSheet();
        useRouteStore.getState().clearSelection();
        useGuidanceStore.getState().endGuidance();
        notifyTripEnded();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!enabled || !routeOption) {
      if (wasActive.current) {
        notifyTripEnded();
        dismissContextualNotification();
        wasActive.current = false;
        prevLegIndex.current = null;
        lastNotifiedMessage.current = null;
        lastNotifiedTime.current = 0;
      }
      return;
    }

    const destinationName =
      useLocationStore.getState().destination?.resolvedStopName ??
      useLocationStore.getState().destination?.name ??
      routeOption.legs[routeOption.legs.length - 1]?.toStopName ??
      i18n.t("guidance.destination");

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
      lastNotifiedMessage.current = null;
      lastNotifiedTime.current = 0;
      updateTripNotification(destinationName, instruction, subtitle);
    }
  }, [enabled, routeOption, currentLegIndex]);

  useEffect(() => {
    if (!enabled || !contextualMessage) return;
    if (!messagesToNotify.includes(contextualMessage)) return;

    if (contextualMessage === lastNotifiedMessage.current) {
      if (Date.now() - lastNotifiedTime.current < MIN_CONTEXTUAL_INTERVAL) {
        return;
      }
    }

    lastNotifiedMessage.current = contextualMessage;
    lastNotifiedTime.current = Date.now();

    const title =
      useLocationStore.getState().destination?.resolvedStopName ??
      useLocationStore.getState().destination?.name ??
      i18n.t("guidance.destination");

    notifyContextualEvent(title, contextualMessage);
  }, [enabled, contextualMessage, messagesToNotify]);
}
