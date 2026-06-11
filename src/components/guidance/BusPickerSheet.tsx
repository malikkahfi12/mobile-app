import { useCallback, useEffect, useMemo, useRef, memo } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useNearbyStops } from "@/hooks/stops/useNearbyStops";
import { useBatchDepartures } from "@/hooks/api/useDepartures";
import { useLocationStore } from "@/store/location.store";
import { useGuidanceStore } from "@/store/guidance.store";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { colors } from "@/constants/colors";
import { TAB_BAR_HEIGHT, TAB_BAR_BOTTOM_MARGIN } from "@/components/navigation/FloatingTabBar";
import type { Departure } from "@/services/departures/departures.types";

interface BusOption {
  routeId: string;
  routeName: string;
  headsign: string;
  stopId: string;
  stopName: string;
  departureSeconds: number;
}

function formatRelativeTime(seconds: number): string {
  const now = new Date();
  const nowSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let diff = seconds - nowSeconds;

  if (diff < 0) diff += 24 * 3600;
  if (diff < 60) return "now";
  if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
  return "";
}

function deduplicateOptions(
  stops: { id: string; name: string }[],
  departuresMap: Record<string, Departure[]>,
): BusOption[] {
  const seen = new Set<string>();
  const result: BusOption[] = [];

  for (const stop of stops) {
    const deps = departuresMap[stop.id] ?? [];
    for (const dep of deps) {
      if (seen.has(dep.routeId)) continue;
      seen.add(dep.routeId);
      result.push({
        routeId: dep.routeId,
        routeName: dep.routeName,
        headsign: dep.headsign,
        stopId: stop.id,
        stopName: stop.name,
        departureSeconds: dep.departureSeconds,
      });
    }
  }

  result.sort((a, b) => a.departureSeconds - b.departureSeconds);
  return result;
}

const BusOptionRow = memo(function BusOptionRow({
  option,
  onPress,
}: {
  option: BusOption;
  onPress: () => void;
}) {
  const relativeTime = useMemo(
    () => formatRelativeTime(option.departureSeconds),
    [option.departureSeconds],
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3.5 border-b border-gray-50"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Ionicons name="bus-outline" size={20} color={colors.primary} />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
          {option.routeName}
        </Text>
        <Text className="text-xs text-primary font-medium" numberOfLines={1}>
          toward {option.headsign}
        </Text>
        <Text className="text-xs text-gray-400" numberOfLines={1}>
          at {option.stopName}
        </Text>
      </View>

      <View className="items-end ml-2">
        <Text className="text-sm font-bold text-primary">
          {relativeTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export const BusPickerSheet = memo(function BusPickerSheet() {
  const { t } = useTranslation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN;

  const setOrigin = useLocationStore((s) => s.setOrigin);
  const endGuidance = useGuidanceStore((s) => s.endGuidance);
  const clearSelection = useRouteStore((s) => s.clearSelection);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);
  const closeBottomSheet = useUIStore((s) => s.closeBottomSheet);

  const snapPoints = useMemo(() => ["30%", "55%"], []);

  useEffect(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const { data: stops, isLoading: stopsLoading } = useNearbyStops({ radius: 500 });

  const batchParams = useMemo(() => {
    if (!stops || stops.length === 0) return null;
    return { stops: stops.map((s) => s.id), limit: 5 };
  }, [stops]);

  const {
    data: departuresMap,
    isLoading: depsLoading,
    isError: depsError,
    refetch: retryDeps,
  } = useBatchDepartures(batchParams);

  const busOptions = useMemo(() => {
    if (!stops || !departuresMap) return [];
    return deduplicateOptions(stops, departuresMap);
  }, [stops, departuresMap]);

  const isLoading = stopsLoading || (!!batchParams && depsLoading);
  const showEmpty = !isLoading && busOptions.length === 0;
  const showError = depsError && !depsLoading;

  const handleSelect = useCallback(
    (option: BusOption) => {
      endGuidance();
      clearSelection();
      setOrigin({
        type: "stop",
        stopId: option.stopId,
        name: option.stopName,
        latitude: 0,
        longitude: 0,
      });
      setBottomSheet("routingResult");
    },
    [endGuidance, clearSelection, setOrigin, setBottomSheet],
  );

  const handleClose = useCallback(() => {
    closeBottomSheet();
  }, [closeBottomSheet]);

  const renderItem = useCallback(
    ({ item }: { item: BusOption }) => (
      <BusOptionRow option={item} onPress={() => handleSelect(item)} />
    ),
    [handleSelect],
  );

  const keyExtractor = useCallback(
    (item: BusOption) => item.routeId,
    [],
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
      onClose={handleClose}
    >
      <BottomSheetFlatList
        data={busOptions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={
          <View className="px-4 pt-3 pb-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">
                  {t("guidance.busPickerTitle")}
                </Text>
                <Text className="mt-0.5 text-xs text-gray-400">
                  {t("guidance.busPickerHint")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="mt-3 text-sm text-gray-400">
                {t("guidance.busPickerLoading")}
              </Text>
            </View>
          ) : showError ? (
            <View className="items-center px-4 py-12">
              <Ionicons
                name="cloud-offline-outline"
                size={40}
                color={colors.error}
              />
              <Text className="mt-3 text-sm text-gray-500 text-center">
                {t("guidance.busPickerError")}
              </Text>
              <TouchableOpacity
                onPress={() => retryDeps()}
                className="mt-4 rounded-full bg-primary px-6 py-2"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-white">
                  {t("common.retryTap")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : showEmpty ? (
            <View className="items-center px-4 py-12">
              <Ionicons
                name="bus-outline"
                size={40}
                color={colors.textTertiary}
              />
              <Text className="mt-3 text-sm text-gray-500 text-center">
                {t("guidance.busPickerEmpty")}
              </Text>
            </View>
          ) : null
        }
      />
    </BottomSheet>
  );
});
