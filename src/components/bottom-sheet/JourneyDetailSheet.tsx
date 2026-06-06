import { useCallback, useMemo, useRef, memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useGuidanceStore } from "@/store/guidance.store";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { useLocationStore } from "@/store/location.store";
import {
  setupNotifications,
  requestPermissions,
  getPermissionStatus,
} from "@/services/notifications";
import { colors } from "@/constants/colors";
import {
  formatDistance,
  getLegIcon,
  getLegLabel,
  getLegsSummary,
  getTransferCount,
  mergeConsecutiveTransitLegs,
} from "@/lib/routing.helpers";
import type { MergedLeg } from "@/lib/routing.helpers";
import { TAB_BAR_HEIGHT, TAB_BAR_BOTTOM_MARGIN } from "@/components/navigation/FloatingTabBar";

const SNAP_POINTS = ["65%", "92%"];

const LegTimelineRow = memo(function LegTimelineRow({
  leg,
  isLast,
}: {
  leg: MergedLeg;
  isLast: boolean;
}) {
  const { t } = useTranslation();
  const isWalk = leg.type === "WALK";
  const durationMin = Math.round(leg.durationSeconds / 60);
  const iconName = getLegIcon(leg);
  const label = getLegLabel(leg);
  const hasIntermediateStops =
    !isWalk && leg.intermediateStops && leg.intermediateStops.length > 2;

  const formattedRoute =
    leg.routeName ? `${t("journey.linePrefix")}${leg.routeName}` : "";

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
            {formattedRoute}
          </Text>
        )}

        {hasIntermediateStops ? (
          <View className="mt-2 bg-gray-50 rounded-lg px-3 py-2">
            {leg.intermediateStops!.map((stopName, si) => (
              <View key={si}>
                {si > 0 && (
                  <Text className="text-[11px] text-primary/50 my-1 ml-3">
                    ↓ {t("journey.continueSameBus", { route: formattedRoute })}
                  </Text>
                )}
                <View className="flex-row items-center">
                  <View
                    className={`h-1.5 w-1.5 rounded-full mr-2 ${
                      si === 0 || si === leg.intermediateStops!.length - 1
                        ? "bg-primary/50"
                        : "bg-gray-300"
                    }`}
                  />
                  <Text className="text-xs text-gray-700 flex-1" numberOfLines={1}>
                    {stopName}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="mt-2 bg-gray-50 rounded-lg px-3 py-2">
            <View className="flex-row items-center">
              <Text className="text-xs font-medium text-gray-500 w-12">{t("journey.from")}</Text>
              <Text className="text-xs text-gray-700 flex-1" numberOfLines={1}>
                {leg.fromStopName}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Text className="text-xs font-medium text-gray-500 w-12">{t("journey.to")}</Text>
              <Text className="text-xs text-gray-700 flex-1" numberOfLines={1}>
                {leg.toStopName}
              </Text>
            </View>
          </View>
        )}
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
  const { t } = useTranslation();
  const items: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }[] = [];

  items.push({
    icon: "time-outline",
    label: t("journey.duration"),
    value: `${totalDurationMin} min`,
  });

  items.push({
    icon: "swap-horizontal-outline",
    label: t("journey.transfers"),
    value: transfers === 0 ? t("common.direct") : `${transfers}`,
  });

  if (walkingDurationMin != null) {
    items.push({
      icon: "walk-outline",
      label: t("journey.walking"),
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
  const { t } = useTranslation();
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

  const mergedLegs = useMemo(
    () => option ? mergeConsecutiveTransitLegs(option.legs) : [],
    [option],
  );

  const totalDurationMin = option
    ? Math.round(option.totalDurationSeconds / 60)
    : 0;
  const walkingDurationMin =
    option && option.walkingDurationSeconds > 0
      ? Math.round(option.walkingDurationSeconds / 60)
      : null;
  const transfers = mergedLegs.length > 0 ? getTransferCount(mergedLegs) : 0;
  const legsSummary = mergedLegs.length > 0 ? getLegsSummary(mergedLegs) : "";

  const originName = origin?.name;
  const destinationName = destination?.name;

  const startGuidance = useGuidanceStore((s) => s.startGuidance);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);
  const closeBottomSheet = useUIStore((s) => s.closeBottomSheet);
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN;

  const handleStart = useCallback(async () => {
    if (!option) return;

    useRouteStore.getState().setSelectedStop(null);

    setupNotifications();

    const currentStatus = await getPermissionStatus();
    if (currentStatus !== "granted") {
      await requestPermissions();
    }

    startGuidance(option);
    closeBottomSheet();
  }, [option, startGuidance, closeBottomSheet]);

  const handleBack = useCallback(() => {
    setBottomSheet("routingResult");
  }, [setBottomSheet]);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      bottomInset={bottomInset}
      handleIndicatorStyle={{
        backgroundColor: colors.textTertiary,
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: colors.white }}
      footerComponent={
        option
          ? origin?.type === "currentLocation"
            ? () => (
                <View
                  className="px-4 pt-4 bg-white border-t border-gray-100/60"
                  style={{ paddingBottom: insets.bottom + 16 }}
                >
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
                        {t("journey.startNavigation")}
                      </Text>
                    </View>
                    <Text className="mt-1 text-[11px] text-white/70">
                      {t("journey.startNavigationSub")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            : () => (
                <View
                  className="px-4 pt-4 bg-white border-t border-gray-100/60"
                  style={{ paddingBottom: insets.bottom + 16 }}
                >
                <View className="flex-row items-center rounded-2xl bg-primary/5 border border-primary/10 py-4 px-4">
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text className="ml-2 text-sm text-gray-500 flex-1">
                    {t("journey.startNavOnlyCurrentLocation")}
                  </Text>
                </View>
                </View>
              )
          : undefined
      }
    >
      <BottomSheetScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        <View className="flex-row items-center justify-between px-4 pt-2 pb-2 border-b border-gray-100">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            <Text className="ml-1 text-base font-semibold text-gray-900">
              {t("journey.routeOptions")}
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
                {t("journey.stepByStep")}
              </Text>

              {mergedLegs.map((leg, li) => (
                <LegTimelineRow
                  key={li}
                  leg={leg}
                  isLast={li === mergedLegs.length - 1}
                />
              ))}
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});
