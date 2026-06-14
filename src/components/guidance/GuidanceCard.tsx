import { useCallback, useMemo, memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useGuidanceStore } from "@/store/guidance.store";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { useLocationStore } from "@/store/location.store";
import { useRouteDetail } from "@/hooks/routes/useRouteDetail";
import { useReroute } from "@/hooks/guidance/useReroute";
import { notifyTripEnded } from "@/services/notifications";
import { colors } from "@/constants/colors";
import {
  getLegDurationMinutes,
  getLegIcon,
  getTotalDuration,
  getTransferCount,
  getInstructionTitle,
  getInstructionSubtitle,
  countLegStops,
  formatETATime,
} from "@/lib/routing.helpers";
import type { Leg } from "@/services/routing/routing.types";

function getRemainingMinutes(legs: Leg[], startIndex: number): number {
  let total = 0;
  for (let i = startIndex; i < legs.length; i++) {
    total += legs[i].durationSeconds;
  }
  return Math.round(total / 60);
}

export const GuidanceCard = memo(function GuidanceCard() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const isActive = useGuidanceStore((s) => s.isActive);
  const routeOption = useGuidanceStore((s) => s.routeOption);
  const currentLegIndex = useGuidanceStore((s) => s.currentLegIndex);
  const contextualMessage = useGuidanceStore((s) => s.contextualMessage);
  const endGuidance = useGuidanceStore((s) => s.endGuidance);
  const isDeviated = useGuidanceStore((s) => s.isDeviated);
  const locationAccuracy = useLocationStore((s) => s.locationAccuracy);

  const { reroute } = useReroute();

  const gpsColor = useMemo(() => {
    if (locationAccuracy == null) return "#9CA3AF";
    if (locationAccuracy <= 15) return "#16A34A";
    if (locationAccuracy <= 50) return "#D97706";
    return "#DC2626";
  }, [locationAccuracy]);

  const currentLeg = useMemo(
    () => routeOption?.legs[currentLegIndex] ?? null,
    [routeOption, currentLegIndex],
  );

  const nextLeg = useMemo(() => {
    if (!routeOption) return null;
    if (currentLegIndex >= routeOption.legs.length - 1) return null;
    return routeOption.legs[currentLegIndex + 1] ?? null;
  }, [routeOption, currentLegIndex]);

  const isLastLeg = currentLegIndex >= (routeOption?.legs.length ?? 0) - 1;
  const isTransfer =
    currentLeg?.type === "TRANSIT" &&
    nextLeg?.type === "TRANSIT" &&
    currentLeg.routeId !== nextLeg.routeId;

  const totalLegs = routeOption?.legs.length ?? 0;

  const remainingMin = useMemo(() => {
    if (!routeOption) return 0;
    return getRemainingMinutes(routeOption.legs, currentLegIndex);
  }, [routeOption, currentLegIndex]);

  const totalMin = useMemo(() => {
    if (!routeOption) return 0;
    return getTotalDuration(routeOption.legs);
  }, [routeOption]);

  const transferCount = useMemo(() => {
    if (!routeOption) return 0;
    return getTransferCount(routeOption.legs);
  }, [routeOption]);

  const arrivalTime = useMemo(() => {
    if (!routeOption) return null;
    const firstLeg = routeOption.legs[0];
    if (firstLeg.departureTimeSeconds == null) return null;
    const arrivalSec =
      firstLeg.departureTimeSeconds + routeOption.totalDurationSeconds;
    return formatETATime(arrivalSec);
  }, [routeOption]);

  const activeRouteId =
    currentLeg?.type === "TRANSIT" ? (currentLeg.routeId ?? null) : null;
  const { stops: routeStops } = useRouteDetail(activeRouteId ?? "");

  const remainingStops = useMemo(() => {
    if (
      !currentLeg ||
      !routeStops ||
      currentLeg.type !== "TRANSIT"
    )
      return null;
    return countLegStops(routeStops, currentLeg.fromStopId, currentLeg.toStopId);
  }, [currentLeg, routeStops]);

  const destinationName = useMemo(() => {
    if (!routeOption) return null;
    const lastLeg = routeOption.legs[routeOption.legs.length - 1];
    return lastLeg?.toStopName ?? null;
  }, [routeOption]);

  const defaultMessage = useMemo(() => {
    if (!currentLeg) return null;
    if (isLastLeg) return null;
    if (currentLeg.type === "WALK") return t("guidance.walkToStop");
    if (currentLeg.type === "TRANSIT" && !isTransfer) return t("guidance.stayOnBoard");
    if (isTransfer) return t("guidance.transferHere");
    return null;
  }, [currentLeg, isLastLeg, isTransfer, t]);

  const displayMessage = contextualMessage || defaultMessage;

  const title = useMemo(() => {
    if (!currentLeg) return "";
    return getInstructionTitle(currentLeg, isLastLeg, destinationName);
  }, [currentLeg, isLastLeg, destinationName]);

  const subtitle = useMemo(() => {
    if (!currentLeg) return "";
    return getInstructionSubtitle(currentLeg, isLastLeg);
  }, [currentLeg, isLastLeg]);

  const iconName = useMemo(() => {
    if (!currentLeg) return "walk-outline" as const;
    if (isLastLeg) return "flag";
    if (isTransfer) return "swap-horizontal";
    return getLegIcon(currentLeg);
  }, [currentLeg, isLastLeg, isTransfer]);

  const nextTitle = useMemo(() => {
    if (!nextLeg) return null;
    const nextIsLast =
      currentLegIndex + 1 >= (routeOption?.legs.length ?? 0) - 1;
    return getInstructionTitle(nextLeg, nextIsLast, destinationName);
  }, [nextLeg, currentLegIndex, routeOption?.legs.length, destinationName]);

  const nextDurationMin = nextLeg ? getLegDurationMinutes(nextLeg) : null;

  const handleEnd = useCallback(() => {
    notifyTripEnded();
    endGuidance();
    useRouteStore.getState().clearSelection();
    useUIStore.getState().closeBottomSheet();
  }, [endGuidance]);

  const handlePlanNewRoute = useCallback(() => {
    notifyTripEnded();
    endGuidance();
    useRouteStore.getState().clearSelection();
    useLocationStore.getState().clearTrip();
    useUIStore.getState().setBottomSheet("planner");
  }, [endGuidance]);

  const handleReroute = useCallback(() => {
    reroute();
  }, [reroute]);

  const handleWrongBus = useCallback(() => {
    useUIStore.getState().setBottomSheet("busPicker");
  }, []);

  const handleDismissDeviation = useCallback(() => {
    useGuidanceStore.getState().setDeviated(false);
  }, []);

  if (!isActive) return null;

  if (!currentLeg || !routeOption) {
    return (
      <View
        className="absolute left-4 right-4 rounded-2xl bg-white shadow-md"
        style={{ top: insets.top + 12 }}
      >
        <View className="items-center px-4 py-6">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Ionicons
              name="navigate-outline"
              size={24}
              color={colors.textTertiary}
            />
          </View>
          <Text className="mt-3 text-base font-semibold text-gray-500">
            {t("guidance.onTheWay")}
          </Text>
          <Text className="mt-1 text-[13px] text-gray-400">
            {t("guidance.waitingForDetails")}
          </Text>
          <TouchableOpacity
            onPress={handleEnd}
            className="mt-4 rounded-xl border border-red-200 bg-white px-8 py-2.5"
            activeOpacity={0.7}
          >
            <Text className="text-sm font-semibold text-red-500">
              {t("guidance.endTrip")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      className="absolute left-4 right-4 rounded-2xl bg-white shadow-md"
      style={{ top: insets.top + 12 }}
    >
      <View className="px-4 pt-3 pb-3.5">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1 mr-3 flex-row items-center">
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: gpsColor }}
            />
            {destinationName && (
              <Text
                className="ml-1.5 text-sm font-semibold text-gray-900"
                numberOfLines={1}
              >
                {destinationName}
              </Text>
            )}
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center rounded-full bg-gray-100 px-2.5 py-1">
              <Text className="text-xs font-semibold text-gray-600">
                {currentLegIndex + 1}/{totalLegs}
              </Text>
            </View>
            {arrivalTime ? (
              <View className="flex-row items-center rounded-full bg-primary/10 px-2.5 py-1">
                <Ionicons name="flag-outline" size={11} color={colors.primary} />
                <Text className="ml-1 text-[11px] font-semibold text-primary">
                  {arrivalTime}
                </Text>
              </View>
            ) : remainingMin > 0 ? (
              <View className="flex-row items-center rounded-full bg-primary/10 px-2.5 py-1">
                <Ionicons name="time-outline" size={11} color={colors.primary} />
                <Text className="ml-1 text-[11px] font-semibold text-primary">
                  {remainingMin}m
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="flex-row gap-1 mb-2.5">
          {routeOption.legs.map((_, i) => (
            <View
              key={i}
              className="flex-1 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  i < currentLegIndex
                    ? colors.primary + "18"
                    : i === currentLegIndex
                      ? colors.primary
                      : "#E5E7EB",
              }}
            />
          ))}
        </View>

        {displayMessage && (
          <View className="mb-2 flex-row items-center rounded-full bg-primary/10 px-3 py-1 self-start">
            <Ionicons name="locate-outline" size={12} color={colors.primary} />
            <Text className="ml-1.5 text-[11px] font-semibold text-primary">
              {displayMessage}
            </Text>
          </View>
        )}

        <View
          className={`rounded-xl p-3 ${
            isTransfer
              ? "bg-amber-50 border border-amber-100"
              : currentLeg.type === "WALK"
                ? "bg-gray-50 border border-gray-100"
                : "bg-primary/5 border border-primary/10"
          }`}
        >
          <View className="flex-row items-center">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                isTransfer
                  ? "bg-amber-200"
                  : currentLeg.type === "WALK"
                    ? "bg-gray-200"
                    : "bg-primary/15"
              }`}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={
                  isTransfer
                    ? "#B45309"
                    : currentLeg.type === "WALK"
                      ? colors.textSecondary
                      : colors.primary
                }
              />
            </View>

            <View className="ml-3 flex-1">
              <Text
                className="text-base font-bold text-gray-900"
                numberOfLines={2}
              >
                {title}
              </Text>

              <View className="flex-row items-center mt-0.5 flex-wrap gap-x-2 gap-y-0.5">
                {subtitle ? (
                  <Text className="text-xs text-gray-500">{subtitle}</Text>
                ) : null}

                {currentLeg.type === "TRANSIT" && currentLeg.routeName && (
                  <Text className="text-xs text-primary font-semibold">
                    {currentLeg.routeName}
                  </Text>
                )}

                {currentLeg.type === "TRANSIT" && remainingStops != null && remainingStops > 0 && (
                  <View className="flex-row items-center">
                    <Ionicons
                      name="ellipse-outline"
                      size={9}
                      color={colors.textTertiary}
                    />
                    <Text className="ml-1 text-[11px] text-gray-500">
                      {remainingStops} stop{remainingStops !== 1 ? "s" : ""}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {isDeviated && (
          <View className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <View className="flex-row items-center">
              <Ionicons
                name="warning-outline"
                size={14}
                color="#B45309"
              />
              <Text className="ml-2 flex-1 text-xs text-amber-800">
                {t("guidance.offRoute")}
              </Text>
              <TouchableOpacity
                onPress={handleReroute}
                className="rounded-lg bg-amber-200 px-3 py-1.5"
                activeOpacity={0.7}
              >
                <Text className="text-[11px] font-semibold text-amber-900">
                  {t("guidance.rerouteFromHere")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDismissDeviation}
                className="ml-2 h-7 w-7 items-center justify-center rounded-full bg-amber-200"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={13} color="#B45309" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {nextTitle && (
          <View className="mt-2 flex-row items-center rounded-xl bg-gray-50 px-3 py-2">
            <Ionicons
              name="arrow-forward"
              size={12}
              color={colors.textTertiary}
            />
            <Text
              className="ml-2 text-xs text-gray-500 flex-1"
              numberOfLines={1}
            >
              {t("guidance.then")}{nextTitle}
            </Text>
            {nextDurationMin != null && nextDurationMin > 0 && (
              <Text className="text-xs text-gray-400">
                {nextDurationMin} min
              </Text>
            )}
          </View>
        )}

        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
            <Text className="ml-1 text-[11px] text-gray-500">
              {totalMin} min
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons
              name="swap-horizontal-outline"
              size={11}
              color={colors.textSecondary}
            />
            <Text className="ml-1 text-[11px] text-gray-500">
              {transferCount === 0 ? t("common.direct") : `${transferCount} ${t("routes.transfers")}`}
            </Text>
          </View>
          {remainingMin > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="trending-down" size={11} color={colors.textSecondary} />
              <Text className="ml-1 text-[11px] text-gray-500">
                {remainingMin}{t("guidance.mLeft")}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-2 mt-2.5">
          {currentLeg.type === "TRANSIT" && (
            <TouchableOpacity
              onPress={handleWrongBus}
              className="flex-row items-center justify-center rounded-xl bg-gray-100 px-2.5 py-2 flex-1"
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text className="ml-1 text-[11px] font-medium text-gray-600">
                {t("guidance.wrongBus")}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handlePlanNewRoute}
            className="flex-row items-center justify-center rounded-xl bg-gray-100 px-2.5 py-2 flex-1"
            activeOpacity={0.7}
          >
            <Ionicons
              name="compass-outline"
              size={12}
              color={colors.textSecondary}
            />
            <Text className="ml-1 text-[11px] font-medium text-gray-600">
              {t("guidance.newRoute")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleEnd}
            className="flex-row items-center justify-center rounded-xl bg-red-50 px-3 py-2 flex-1"
            activeOpacity={0.7}
          >
            <Ionicons name="stop" size={12} color={colors.error} />
            <Text className="ml-1 text-[11px] font-semibold text-red-500">
              {t("guidance.end")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
