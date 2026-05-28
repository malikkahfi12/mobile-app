import { useCallback, useMemo, useRef, memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGuidanceStore } from "@/store/guidance.store";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { useRouteDetail } from "@/hooks/routes/useRouteDetail";
import { colors } from "@/constants/colors";
import {
  formatDistance,
  getLegDurationMinutes,
  getLegIcon,
  getTotalDuration,
  getTransferCount,
  getBoardingInstruction,
  getWalkingInstruction,
  getTransferText,
  countLegStops,
  formatETATime,
} from "@/lib/routing.helpers";
import type { Leg } from "@/services/routing/routing.types";

const SNAP_POINTS = ["28%", "65%"];

function getInstruction(leg: Leg): string {
  if (leg.type === "WALK") {
    return getWalkingInstruction(leg);
  }
  return getBoardingInstruction(leg);
}

function getRemainingMinutes(legs: Leg[], startIndex: number): number {
  let total = 0;
  for (let i = startIndex; i < legs.length; i++) {
    total += legs[i].durationSeconds;
  }
  return Math.round(total / 60);
}

export const GuidanceSheet = memo(function GuidanceSheet() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);

  const isActive = useGuidanceStore((s) => s.isActive);
  const routeOption = useGuidanceStore((s) => s.routeOption);
  const currentLegIndex = useGuidanceStore((s) => s.currentLegIndex);
  const contextualMessage = useGuidanceStore((s) => s.contextualMessage);
  const nextStep = useGuidanceStore((s) => s.nextStep);
  const previousStep = useGuidanceStore((s) => s.previousStep);
  const endGuidance = useGuidanceStore((s) => s.endGuidance);

  const currentLeg = useMemo(
    () => routeOption?.legs[currentLegIndex] ?? null,
    [routeOption, currentLegIndex],
  );

  const nextLeg = useMemo(() => {
    if (!routeOption) return null;
    if (currentLegIndex >= routeOption.legs.length - 1) return null;
    return routeOption.legs[currentLegIndex + 1] ?? null;
  }, [routeOption, currentLegIndex]);

  const hasPrevLeg = currentLegIndex > 0;
  const hasNextLeg = currentLegIndex < (routeOption?.legs.length ?? 0) - 1;
  const isTransfer =
    currentLeg?.type === "TRANSIT" && nextLeg?.type === "TRANSIT";

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

  const handleEnd = useCallback(() => {
    endGuidance();
    useRouteStore.getState().clearSelection();
    useUIStore.getState().closeBottomSheet();
  }, [endGuidance]);

  const handleNext = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handlePrev = useCallback(() => {
    previousStep();
  }, [previousStep]);

  const guardState = !isActive || !currentLeg || !routeOption;

  if (guardState) {
    if (isActive) {
      return (
        <BottomSheet
          ref={sheetRef}
          snapPoints={SNAP_POINTS}
          index={0}
          enableDynamicSizing={false}
          enablePanDownToClose={false}
          handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
          backgroundStyle={{ backgroundColor: colors.white }}
        >
          <View
            className="flex-1 items-center justify-center px-4"
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            <Ionicons
              name="bus-outline"
              size={32}
              color={colors.textTertiary}
            />
            <Text className="mt-2 text-base font-medium text-gray-500">
              On the way…
            </Text>
            <Text className="mt-1 text-xs text-gray-400">
              Step details unavailable
            </Text>
            <TouchableOpacity
              onPress={handleEnd}
              className="mt-5 rounded-xl bg-red-50 px-8 py-2.5"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-red-500">
                End Trip
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      );
    }
    return null;
  }

  const isWalk = currentLeg.type === "WALK";
  const iconName = getLegIcon(currentLeg);
  const instruction = getInstruction(currentLeg);
  const durationMin = getLegDurationMinutes(currentLeg);
  const transferText =
    isTransfer && nextLeg ? getTransferText(currentLeg, nextLeg) : null;

  const nextIconName = nextLeg ? getLegIcon(nextLeg) : null;
  const nextLabel = nextLeg ? getInstruction(nextLeg) : null;
  const nextDurationMin = nextLeg ? getLegDurationMinutes(nextLeg) : null;

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      index={0}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      backgroundStyle={{ backgroundColor: colors.white }}
    >
      <View
        className="flex-1 px-4 pt-1"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-1">
            {destinationName && (
              <Text
                className="text-sm font-semibold text-gray-900"
                numberOfLines={1}
              >
                {destinationName}
              </Text>
            )}
          </View>
          {arrivalTime ? (
            <View className="flex-row items-center rounded-full bg-primary/10 px-2.5 py-1">
              <Ionicons
                name="flag-outline"
                size={11}
                color={colors.primary}
              />
              <Text className="ml-1 text-[11px] font-semibold text-primary">
                Arrive {arrivalTime}
              </Text>
            </View>
          ) : remainingMin > 0 ? (
            <View className="flex-row items-center rounded-full bg-primary/10 px-2.5 py-1">
              <Ionicons
                name="time-outline"
                size={11}
                color={colors.primary}
              />
              <Text className="ml-1 text-[11px] font-semibold text-primary">
                {remainingMin} min
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row gap-1 mb-3">
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

        {contextualMessage && (
          <View className="mb-2.5 flex-row items-center rounded-lg bg-primary/10 px-3 py-2">
            <Ionicons
              name="locate-outline"
              size={14}
              color={colors.primary}
            />
            <Text className="ml-1.5 text-xs font-semibold text-primary">
              {contextualMessage}
            </Text>
          </View>
        )}

        <View
          className={`rounded-xl p-3 ${
            isWalk ? "bg-gray-50" : "bg-primary/5 border border-primary/10"
          }`}
        >
          <View className="flex-row items-start">
            <View
              className={`h-11 w-11 items-center justify-center rounded-full ${
                isWalk ? "bg-gray-200" : "bg-primary/15"
              }`}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isWalk ? colors.textSecondary : colors.primary}
              />
            </View>

            <View className="ml-3 flex-1">
              <Text
                className={`${
                  isWalk
                    ? "text-sm font-semibold text-gray-900"
                    : "text-sm font-bold text-gray-900"
                }`}
                numberOfLines={2}
              >
                {instruction}
              </Text>

              <View className="flex-row items-center mt-1 flex-wrap gap-x-2 gap-y-0.5">
                {durationMin > 0 && (
                  <Text className="text-xs text-gray-500">
                    {durationMin} min
                  </Text>
                )}
                {isWalk && currentLeg.distanceMeters != null && (
                  <Text className="text-xs text-gray-400">
                    {formatDistance(currentLeg.distanceMeters)}
                  </Text>
                )}
                {!isWalk && currentLeg.routeName && (
                  <Text className="text-xs text-primary font-medium">
                    {currentLeg.routeName}
                  </Text>
                )}
                {!isWalk && currentLeg.headsign && (
                  <Text className="text-xs text-gray-400" numberOfLines={1}>
                    → {currentLeg.headsign}
                  </Text>
                )}
              </View>

              {remainingStops != null && remainingStops > 0 && (
                <View className="flex-row items-center mt-1.5">
                  <Ionicons
                    name="ellipse-outline"
                    size={10}
                    color={colors.textTertiary}
                  />
                  <Text className="ml-1 text-[11px] text-gray-500">
                    {remainingStops} stop{remainingStops !== 1 ? "s" : ""}{" "}
                    remaining
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="mt-2.5 bg-gray-100 rounded-lg px-3 py-2">
            {isWalk ? (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-[10px] font-medium text-gray-400 uppercase">
                    Walk from
                  </Text>
                  <Text
                    className="text-xs font-semibold text-gray-800"
                    numberOfLines={1}
                  >
                    {currentLeg.fromStopName}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-medium text-gray-400 uppercase">
                    to
                  </Text>
                  <Text
                    className="text-xs font-semibold text-gray-800"
                    numberOfLines={1}
                  >
                    {currentLeg.toStopName}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-[10px] font-medium text-gray-400 uppercase">
                    From
                  </Text>
                  <Text
                    className="text-xs font-semibold text-gray-800"
                    numberOfLines={1}
                  >
                    {currentLeg.fromStopName}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-medium text-gray-400 uppercase">
                    To
                  </Text>
                  <Text
                    className="text-xs font-semibold text-gray-800"
                    numberOfLines={1}
                  >
                    {currentLeg.toStopName}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {transferText && (
          <View className="mt-2 rounded-lg bg-amber-50 px-3 py-2.5 border border-amber-100">
            <View className="flex-row items-center">
              <Ionicons
                name="swap-horizontal-outline"
                size={14}
                color="#B45309"
              />
              <Text className="ml-1.5 text-xs font-semibold text-amber-800">
                {transferText}
              </Text>
            </View>
          </View>
        )}

        {nextLeg && !transferText && (
          <View className="mt-2 bg-gray-50 rounded-lg px-3 py-2">
            <Text className="text-[10px] font-medium text-gray-400 uppercase mb-1">
              Next
            </Text>
            <View className="flex-row items-center">
              {nextIconName && (
                <Ionicons
                  name={nextIconName}
                  size={14}
                  color={colors.textTertiary}
                />
              )}
              <Text
                className="ml-1.5 text-xs text-gray-500 flex-1"
                numberOfLines={1}
              >
                {nextLabel ?? "Continue"}
              </Text>
              {nextDurationMin != null && nextDurationMin > 0 && (
                <Text className="text-xs text-gray-400">
                  {nextDurationMin} min
                </Text>
              )}
            </View>
          </View>
        )}

        <View className="flex-row items-center justify-between mt-2.5">
          <TouchableOpacity
            onPress={handlePrev}
            disabled={!hasPrevLeg}
            className={`h-9 w-9 items-center justify-center rounded-full ${
              hasPrevLeg ? "bg-gray-100" : "opacity-30"
            }`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {hasNextLeg ? (
            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 mx-2 items-center justify-center rounded-xl bg-primary py-2.5"
              activeOpacity={0.7}
            >
              <Text className="text-[14px] font-semibold text-white">
                Next Step
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-1 mx-2 items-center justify-center rounded-xl bg-primary/10 py-2.5">
              <View className="flex-row items-center">
                <Ionicons name="flag" size={16} color={colors.primary} />
                <Text className="ml-1.5 text-[14px] font-semibold text-primary">
                  Final Step
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleEnd}
            className="h-9 w-9 items-center justify-center rounded-full bg-red-50"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="stop" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center gap-4 mt-2.5">
          <View className="flex-row items-center">
            <Ionicons
              name="time-outline"
              size={11}
              color={colors.textSecondary}
            />
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
              {transferCount === 0 ? "Direct" : `${transferCount} transfers`}
            </Text>
          </View>
        </View>

        <Text className="text-center text-[11px] text-gray-300 mt-1">
          Step {currentLegIndex + 1} of {routeOption.legs.length}{" "}
          {remainingMin > 0 ? `· ${remainingMin} min remaining` : ""}
        </Text>
      </View>
    </BottomSheet>
  );
});
