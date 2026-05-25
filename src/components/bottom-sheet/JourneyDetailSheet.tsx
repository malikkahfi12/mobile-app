import { useCallback, useMemo, useRef, memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useGuidanceStore } from "@/store/guidance.store";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { useLocationStore } from "@/store/location.store";
import { colors } from "@/constants/colors";
import {
  formatDistance,
  getLegIcon,
  getLegLabel,
  getLegsSummary,
} from "@/lib/routing.helpers";
import type { Leg } from "@/services/routing/routing.types";

const SNAP_POINTS = ["65%", "92%"];

const LegTimelineRow = memo(function LegTimelineRow({
  leg,
  isLast,
}: {
  leg: Leg;
  isLast: boolean;
}) {
  const isWalk = leg.type === "WALK";
  const durationMin = Math.round(leg.durationSeconds / 60);
  const iconName = getLegIcon(leg);
  const label = getLegLabel(leg);

  return (
    <View className="flex-row">
      <View className="items-center mr-4 w-8">
        <View
          className={`h-8 w-8 items-center justify-center rounded-full ${
            isWalk ? "bg-gray-100" : "bg-primary/10"
          }`}
        >
          <Ionicons
            name={iconName}
            size={16}
            color={isWalk ? colors.textSecondary : colors.primary}
          />
        </View>
        {!isLast && <View className="flex-1 w-0.5 bg-gray-200 my-1" />}
      </View>

      <View className="flex-1 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-900">
            {label}
          </Text>
          {durationMin > 0 && (
            <Text className="text-sm font-medium text-gray-400">
              {durationMin} min
            </Text>
          )}
        </View>

        {isWalk && leg.distanceMeters != null && (
          <Text className="text-xs text-gray-400 mt-0.5">
            {formatDistance(leg.distanceMeters)}
          </Text>
        )}

        {!isWalk && leg.routeName && (
          <Text className="text-xs text-primary mt-0.5">
            Line {leg.routeName}
          </Text>
        )}

        <View className="mt-2 bg-gray-50 rounded-lg px-3 py-2">
          <View className="flex-row items-center">
            <Text className="text-xs font-medium text-gray-500 w-12">From</Text>
            <Text className="text-xs text-gray-700 flex-1" numberOfLines={1}>
              {leg.fromStopName}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-xs font-medium text-gray-500 w-12">To</Text>
            <Text className="text-xs text-gray-700 flex-1" numberOfLines={1}>
              {leg.toStopName}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

function JourneySummaryBar({
  totalDurationMin,
  transfers,
  walkingDurationMin,
}: {
  totalDurationMin: number;
  transfers: number;
  walkingDurationMin: number | null;
}) {
  const items: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }[] = [];

  items.push({
    icon: "time-outline",
    label: "Duration",
    value: `${totalDurationMin} min`,
  });

  items.push({
    icon: "swap-horizontal-outline",
    label: "Transfers",
    value: transfers === 0 ? "Direct" : `${transfers}`,
  });

  if (walkingDurationMin != null) {
    items.push({
      icon: "walk-outline",
      label: "Walking",
      value: `${walkingDurationMin} min`,
    });
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((item) => (
        <View
          key={item.label}
          className="flex-row items-center rounded-full bg-gray-100 px-3 py-1.5"
        >
          <Ionicons name={item.icon} size={12} color={colors.textSecondary} />
          <Text className="ml-1 text-[11px] text-gray-500">{item.label}</Text>
          <Text className="ml-1 text-[11px] font-semibold text-gray-700">{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export const JourneyDetailSheet = memo(function JourneyDetailSheet() {
  const sheetRef = useRef<BottomSheet>(null);
  const scrollRef = useRef<any>(null);

  const journeyResult = useRouteStore((s) => s.journeyResult);
  const selectedRouteOptionIndex = useRouteStore((s) => s.selectedRouteOptionIndex);
  const origin = useLocationStore((s) => s.origin);
  const destination = useLocationStore((s) => s.destination);

  const option = useMemo(() => {
    if (journeyResult == null || selectedRouteOptionIndex == null) return null;
    return journeyResult.options[selectedRouteOptionIndex] ?? null;
  }, [journeyResult, selectedRouteOptionIndex]);

  const totalDurationMin = option
    ? Math.round(option.totalDurationSeconds / 60)
    : 0;
  const walkingDurationMin =
    option && option.walkingDurationSeconds > 0
      ? Math.round(option.walkingDurationSeconds / 60)
      : null;
  const transfers = option ? option.transferCount : 0;
  const legsSummary = option ? getLegsSummary(option.legs) : "";

  const originName = origin?.name;
  const destinationName = destination?.name;

  const startGuidance = useGuidanceStore((s) => s.startGuidance);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);
  const closeBottomSheet = useUIStore((s) => s.closeBottomSheet);

  const handleStart = useCallback(() => {
    if (!option) return;
    startGuidance(option);
    setBottomSheet(0, "guidance");
  }, [option, startGuidance, setBottomSheet]);

  const handleBack = useCallback(() => {
    setBottomSheet(1, "routingResult");
  }, [setBottomSheet]);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleIndicatorStyle={{
        backgroundColor: colors.textTertiary,
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: colors.white }}
    >
      <BottomSheetScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="flex-row items-center justify-between px-4 pt-2 pb-2 border-b border-gray-100">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            <Text className="ml-1 text-base font-semibold text-gray-900">
              Route Options
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={closeBottomSheet}
            className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {option && (
          <>
            <View className="px-4 pt-4 pb-2">
              <JourneySummaryBar
                totalDurationMin={totalDurationMin}
                transfers={transfers}
                walkingDurationMin={walkingDurationMin}
              />
            </View>

            {originName && destinationName ? (
              <View className="px-4 mb-1">
                <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
                  <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>
                    {originName}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={colors.textTertiary}
                    style={{ marginHorizontal: 8 }}
                  />
                  <Text className="text-xs text-gray-600 flex-1 text-right" numberOfLines={1}>
                    {destinationName}
                  </Text>
                </View>
              </View>
            ) : null}

            {legsSummary ? (
              <View className="px-4 mt-1">
                <Text className="text-[13px] text-gray-400" numberOfLines={2}>
                  {legsSummary}
                </Text>
              </View>
            ) : null}

            <View className="px-4 pt-4">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Step-by-Step
              </Text>

              {option.legs.map((leg, li) => (
                <LegTimelineRow
                  key={li}
                  leg={leg}
                  isLast={li === option.legs.length - 1}
                />
              ))}
            </View>

            <View className="px-4 pt-6">
              <TouchableOpacity
                className="items-center justify-center rounded-2xl bg-primary py-4"
                activeOpacity={0.7}
                onPress={handleStart}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="navigate-outline"
                    size={20}
                    color={colors.white}
                  />
                  <Text className="ml-2 text-base font-semibold text-white">
                    Start Navigation
                  </Text>
                </View>
                <Text className="mt-1 text-[11px] text-white/70">
                  Begin step-by-step guidance
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});
