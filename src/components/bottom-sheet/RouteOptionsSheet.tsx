import { useEffect, useMemo, useRef, useCallback, memo } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetScrollViewMethods,
} from "@gorhom/bottom-sheet";
import type { RoutingResult, RouteOption, Leg } from "@/services/routing/routing.types";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import {
  getLegIcon,
  getLegsSummary,
  isWalkOnly,
  getBestOptionIndex,
} from "@/lib/routing.helpers";
import { colors } from "@/constants/colors";

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

function getTransitLegs(legs: Leg[]): Leg[] {
  return legs.filter((l) => l.type === "TRANSIT");
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
  const totalDuration = Math.round(option.totalDurationSeconds / 60);
  const walkingDuration = option.walkingDurationSeconds > 0
    ? Math.round(option.walkingDurationSeconds / 60)
    : null;
  const transfers = option.transferCount;
  const transitLegs = getTransitLegs(option.legs);
  const legsSummary = getLegsSummary(option.legs);

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
              Recommended
            </Text>
          </View>
        </View>
      )}

      <View className="px-4 py-3.5">
        <View className="flex-row items-center justify-between">
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

          <View className="flex-row items-center gap-2">
            {walkingDuration != null && (
              <View className="flex-row items-center rounded-full bg-gray-100 px-2 py-0.5">
                <Ionicons
                  name="walk-outline"
                  size={11}
                  color={colors.textSecondary}
                />
                <Text className="ml-1 text-[11px] font-medium text-gray-500">
                  {walkingDuration} min walk
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
                  ? "Direct"
                  : `${transfers} transfer${transfers > 1 ? "s" : ""}`}
              </Text>
            </View>
          </View>
        </View>

        {transitLegs.length > 0 && (
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
                  {leg.routeName || "Transit"}
                </Text>
              </View>
            ))}
          </View>
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null);
  const prevContentHeight = useRef(0);
  const snapPoints = useMemo(() => ["25%", "65%"], []);

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
      useUIStore.getState().setBottomSheet(1, "journeyDetail");
    },
    [result],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose={false}
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
        contentContainerStyle={{ paddingBottom: 24 }}
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
              Finding routes...
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
              {errorMessage || "Failed to find routes. Please try again."}
            </Text>
            <TouchableOpacity
              onPress={onRetry}
              className="mt-4 rounded-full bg-primary px-6 py-2"
            >
              <Text className="text-sm font-semibold text-white">
                Tap to Retry
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
              No routes found between these stops.
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
                Walk-Only Route
              </Text>
            </View>
            <Text className="text-sm text-amber-700 mb-2">
              No transit service is available between these stops.
            </Text>
            <Text className="text-xs text-amber-600">
              Transit may be available at nearby stops. Try searching for
              alternative stops in the Planner.
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
                    Showing cached results — may be outdated
                  </Text>
                </View>
              )}
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Route Options
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
