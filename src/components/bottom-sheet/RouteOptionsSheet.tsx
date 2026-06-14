import { useEffect, useMemo, useRef, useCallback, memo } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetScrollViewMethods,
} from "@gorhom/bottom-sheet";
import type { RoutingResult, RouteOption } from "@/services/routing/routing.types";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import {
  getLegIcon,
  getLegsSummary,
  isWalkOnly,
  getBestOptionIndex,
  mergeConsecutiveTransitLegs,
  getStrategyLabel,
  getStrategyColor,
  getStrategyIcon,
  formatWaitingTime,
} from "@/lib/routing.helpers";
import { colors } from "@/constants/colors";
import { TAB_BAR_HEIGHT, TAB_BAR_BOTTOM_MARGIN } from "@/components/navigation/FloatingTabBar";

interface RouteOptionsSheetProps {
  result: RoutingResult | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | undefined;
  originName: string | undefined;
  destinationName: string | undefined;
  dataUpdatedAt?: number;
  onRetry: () => void;
  onClose: () => void;
}

const RouteOptionCard = memo(function RouteOptionCard({
  option,
  isRecommended,
  onSelect,
}: {
  option: RouteOption;
  isRecommended: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const totalDuration = Math.round(option.totalDurationSeconds / 60);
  const walkingDuration = option.walkingDurationSeconds > 0
    ? Math.round(option.walkingDurationSeconds / 60)
    : null;
  const transfers = option.transferCount;
  const mergedLegs = useMemo(() => mergeConsecutiveTransitLegs(option.legs), [option.legs]);
  const transitLegs = mergedLegs.filter((l) => l.type === "TRANSIT");
  const legsSummary = getLegsSummary(mergedLegs);
  const strategyLabel = getStrategyLabel(option.strategy);
  const strategyColor = getStrategyColor(option.strategy);
  const strategyIcon = getStrategyIcon(option.strategy);
  const waitingLabel = formatWaitingTime(option.waitingDurationSeconds);

  const altNames = useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const leg of transitLegs) {
      for (const r of leg.alternativeRoutes ?? []) {
        if (!seen.has(r.routeName)) {
          seen.add(r.routeName);
          names.push(r.routeName);
        }
      }
    }
    return names;
  }, [transitLegs]);

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      className="rounded-xl mb-2 overflow-hidden bg-gray-50"
    >
      {isRecommended && (
        <View className="bg-primary px-4 py-1.5">
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color={colors.white} />
            <Text className="ml-1.5 text-[11px] font-semibold text-white uppercase tracking-wider">
              {t("common.recommended")}
            </Text>
          </View>
        </View>
      )}

      <View className="px-4 py-3.5">
        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1.5">
          <View className="flex-row items-center">
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.primary}
            />
            <Text className="ml-1.5 text-base font-bold text-gray-900">
              {totalDuration} min
            </Text>
          </View>

          <View
            className="flex-row items-center rounded-full px-2 py-0.5"
            style={{ backgroundColor: strategyColor + "15" }}
          >
            <Ionicons
              name={strategyIcon}
              size={10}
              color={strategyColor}
            />
            <Text className="ml-1 text-[10px] font-semibold" style={{ color: strategyColor }}>
              {strategyLabel}
            </Text>
          </View>

          {waitingLabel && (
            <View className="flex-row items-center rounded-full bg-gray-100 px-2 py-0.5">
              <Ionicons
                name="hourglass-outline"
                size={11}
                color={colors.textSecondary}
              />
              <Text className="ml-1 text-[11px] font-medium text-gray-500">
                {waitingLabel}
              </Text>
            </View>
          )}
          {walkingDuration != null && (
            <View className="flex-row items-center rounded-full bg-gray-100 px-2 py-0.5">
              <Ionicons
                name="walk-outline"
                size={11}
                color={colors.textSecondary}
              />
              <Text className="ml-1 text-[11px] font-medium text-gray-500">
                {walkingDuration}{t("routes.minWalk")}
              </Text>
            </View>
          )}
          <View className="flex-row items-center rounded-full bg-gray-100 px-2 py-0.5">
            <Ionicons
              name="swap-horizontal-outline"
              size={11}
              color={colors.textSecondary}
            />
            <Text className="ml-1 text-[11px] font-medium text-gray-500">
              {transfers === 0
                ? t("common.direct")
                : `${transfers} ${transfers > 1 ? t("routes.transfers") : t("routes.transfer")}`}
            </Text>
          </View>
        </View>

        {transitLegs.length > 0 && (
          <>
            <View className="mt-2 flex-row flex-wrap items-center gap-x-2 gap-y-1">
              {transitLegs.map((leg, li) => (
                <View
                  key={li}
                  className="flex-row items-center rounded-full bg-primary/10 px-2 py-0.5"
                >
                  <Ionicons
                    name={getLegIcon(leg)}
                    size={12}
                    color={colors.primary}
                  />
                  <Text className="ml-1 text-[11px] font-medium text-primary">
                    {leg.routeName || t("common.transit")}
                  </Text>
                </View>
              ))}
            </View>
            {altNames.length > 0 && (
              <View className="mt-1 flex-row items-center">
                <Ionicons
                  name="git-branch-outline"
                  size={10}
                  color={colors.textTertiary}
                />
                <Text className="ml-0.5 text-[10px] text-gray-400" numberOfLines={1}>
                  {t("journey.alsoServes")} {altNames.join(", ")}
                </Text>
              </View>
            )}
          </>
        )}

        <Text className="mt-2 text-[13px] text-gray-400" numberOfLines={1}>
          {legsSummary}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export const RouteOptionsSheet = memo(function RouteOptionsSheet({
  result,
  isLoading,
  isError,
  errorMessage,
  originName,
  destinationName,
  dataUpdatedAt,
  onRetry,
  onClose,
}: RouteOptionsSheetProps) {
  const { t } = useTranslation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null);
  const prevContentHeight = useRef(0);
  const snapPoints = useMemo(() => ["25%", "65%"], []);
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN;

  const options = useMemo(() => result?.options ?? [], [result?.options]);
  const showResults = !isLoading && !isError && options.length > 0;
  const showEmpty = !isLoading && !isError && result && options.length === 0;

  const bestIndex = useMemo(() => getBestOptionIndex(options), [options]);
  const allWalkOnly = useMemo(
    () => options.length > 0 && options.every(isWalkOnly),
    [options],
  );

  useEffect(() => {
    if (showResults) {
      bottomSheetRef.current?.snapToIndex(1);
    } else if (isLoading) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }, [showResults, isLoading]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (!result) return;
      useRouteStore.getState().setJourneyResult(result);
      useRouteStore.getState().setSelectedRouteOptionIndex(index);
      useUIStore.getState().setBottomSheet("journeyDetail");
    },
    [result],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose={false}
      bottomInset={bottomInset}
      handleIndicatorStyle={{
        backgroundColor: colors.textTertiary,
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: colors.white }}
    >
      <BottomSheetScrollView
        ref={scrollViewRef}
        onContentSizeChange={(_, h) => {
          if (h < prevContentHeight.current) {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
          }
          prevContentHeight.current = h;
        }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="px-4 pt-2 pb-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              {originName ? (
                <View className="flex-row items-center mb-1">
                  <View className="h-3 w-3 rounded-full border-2 border-primary mr-2" />
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {originName}
                  </Text>
                </View>
              ) : null}
              {destinationName ? (
                <View className="flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {destinationName}
                  </Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && (
          <View className="items-center px-4 py-12">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-3 text-sm text-gray-400">
              {t("routes.findingRoutes")}
            </Text>
          </View>
        )}

        {isError && !isLoading && (
          <View className="items-center px-4 py-12">
            <Ionicons
              name="alert-circle-outline"
              size={44}
              color={colors.error}
            />
            <Text className="mt-3 text-sm text-gray-500 text-center">
              {errorMessage || t("routes.findFailed")}
            </Text>
            <TouchableOpacity
              onPress={onRetry}
              className="mt-4 rounded-full bg-primary px-6 py-2"
            >
              <Text className="text-sm font-semibold text-white">
                {t("common.retryTap")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {showEmpty && (
          <View className="items-center px-4 py-12">
            <Ionicons
              name="flag-outline"
              size={44}
              color={colors.textTertiary}
            />
            <Text className="mt-3 text-sm text-gray-400 text-center">
              {t("routes.noRoutesFound")}
            </Text>
          </View>
        )}

        {allWalkOnly && showResults && (
          <View className="mx-4 mt-3 rounded-xl bg-amber-50 px-4 py-4 border border-amber-200">
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="walk-outline"
                size={20}
                color="#B45309"
              />
              <Text className="ml-2 text-base font-semibold text-amber-900">
                {t("routes.walkOnlyTitle")}
              </Text>
            </View>
            <Text className="text-sm text-amber-700 mb-2">
              {t("routes.walkOnlyBody")}
            </Text>
            <Text className="text-xs text-amber-600">
              {t("routes.walkOnlyHint")}
            </Text>
          </View>
        )}

        {showResults && (
          <View className="px-4 pt-3" style={{ flexGrow: 1 }}>
            {dataUpdatedAt != null &&
              Date.now() - dataUpdatedAt > 1000 * 60 * 5 && (
                <View className="mb-3 flex-row items-center justify-center rounded-lg bg-amber-50 px-3 py-1.5 border border-amber-100">
                  <Ionicons
                    name="time-outline"
                    size={11}
                    color="#B45309"
                  />
                  <Text className="ml-1 text-[11px] text-amber-700">
                    {t("routes.cachedWarning")}
                  </Text>
                </View>
              )}
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {t("routes.options")}
            </Text>
            {options.map((option, index) => (
              <RouteOptionCard
                key={index}
                option={option}
                isRecommended={
                  bestIndex !== null &&
                  bestIndex === index &&
                  options.length > 1
                }
                onSelect={() => handleSelectOption(index)}
              />
            ))}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});
