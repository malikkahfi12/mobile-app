import { DepartureRow } from "@/components/stop/DepartureRow";
import { StopHeader } from "@/components/stop/StopHeader";
import { colors } from "@/constants/colors";
import { useNearbyStops } from "@/hooks/stops/useNearbyStops";
import { useStopDetail } from "@/hooks/stops/useStopDetail";
import { useQuickRoute } from "@/hooks/useQuickRoute";
import type { Departure } from "@/services/departures/departures.types";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const StopDetailSheet = memo(function StopDetailSheet() {
  const { t } = useTranslation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const selectedStop = useRouteStore((s) => s.selectedStop);
  const setSelectedStop = useRouteStore((s) => s.setSelectedStop);
  const closeBottomSheet = useUIStore((s) => s.closeBottomSheet);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);
  const insets = useSafeAreaInsets();

  const stopId = selectedStop?.id ?? "";
  const { data, isLoading, isError, dataUpdatedAt, refetch } = useStopDetail(stopId);
  const { data: nearbyStops } = useNearbyStops();
  const { routeToHere, routeFromHere, isRouting } = useQuickRoute(
    selectedStop,
    nearbyStops,
  );

  const snapPoints = useMemo(() => ["45%", "85%"], []);

  useEffect(() => {
    if (selectedStop) {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [selectedStop]);

  const handleClose = useCallback(() => {
    setSelectedStop(null);
    closeBottomSheet();
  }, [setSelectedStop, closeBottomSheet]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index < 0) {
        handleClose();
      }
    },
    [handleClose],
  );

  const departures = data?.departures ?? [];
  const distanceMeters =
    selectedStop && selectedStop.id === data?.id
      ? selectedStop.distance_meters
      : undefined;

  const handlePressDeparture = useCallback(
    (routeId: string) => {
      useRouteStore.getState().setSelectedRouteId(routeId);
      setBottomSheet("routeDetail");
    },
    [setBottomSheet],
  );

  const renderItem = useCallback(
    ({ item }: { item: Departure }) => (
      <DepartureRow
        departure={item}
        onPress={item.routeId ? handlePressDeparture : undefined}
      />
    ),
    [handlePressDeparture],
  );

  const keyExtractor = useCallback(
    (item: Departure, index: number) => `${item.tripId}-${index}`,
    [],
  );

  const showLoading = isLoading && !data;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose={false}
      onChange={handleSheetChange}
      handleIndicatorStyle={{
        backgroundColor: colors.textTertiary,
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: colors.white }}
    >
      <BottomSheetFlatList
        data={departures}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ListHeaderComponent={
          <>
            {data && (
              <View>
                <View className="px-4 pt-2 flex-row items-center justify-end">
                  <TouchableOpacity
                    onPress={handleClose}
                    className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <StopHeader stop={data} distanceMeters={distanceMeters} />

                <View className="mx-4 mt-3">
                  <View className="mt-3 flex-row gap-2">
                    <TouchableOpacity
                      onPress={routeToHere}
                      disabled={isRouting}
                      activeOpacity={0.7}
                      className={`flex-1 flex-row items-center justify-center rounded-lg bg-primary/15 py-2.5 ${
                        isRouting ? "opacity-50" : ""
                      }`}
                    >
                      <Ionicons
                        name="navigate-outline"
                        size={14}
                        color={colors.primary}
                      />
                      <Text className="ml-1 text-xs font-semibold text-primary">
                        {t("common.routeHere")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={routeFromHere}
                      disabled={isRouting}
                      activeOpacity={0.7}
                      className={`flex-1 flex-row items-center justify-center rounded-lg border border-primary/30 py-2.5 ${
                        isRouting ? "opacity-50" : ""
                      }`}
                    >
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={colors.primary}
                      />
                      <Text className="ml-1 text-xs font-semibold text-primary">
                        {t("common.fromHere")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {dataUpdatedAt != null &&
                  Date.now() - dataUpdatedAt > 1000 * 60 && (
                    <View className="mx-4 mt-2 flex-row items-center justify-center rounded-lg bg-amber-50 px-3 py-1.5 border border-amber-100">
                      <Ionicons
                        name="time-outline"
                        size={11}
                        color="#B45309"
                      />
                      <Text className="ml-1 text-[11px] text-amber-700">
                        {t("stops.cachedData")}
                      </Text>
                    </View>
                  )}

                <View className="px-4 pt-6 pb-2">
                  <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {t("stops.upcomingDepartures")}
                  </Text>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          showLoading ? (
            <View className="items-center px-4 py-12">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="mt-3 text-sm text-gray-400">
                {t("stops.loadingDetails")}
              </Text>
            </View>
          ) : isError && !isLoading ? (
            <View className="items-center px-4 py-12">
              <Ionicons
                name="alert-circle-outline"
                size={40}
                color={colors.error}
              />
              <Text className="mt-3 text-sm text-gray-500 text-center">
                {t("stops.detailsFailed")}
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="mt-4 rounded-full bg-primary px-6 py-2"
              >
                <Text className="text-sm font-semibold text-white">
                  {t("common.retryTap")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : !isLoading && data && departures.length === 0 ? (
            <View className="items-center px-4 py-12">
              <Ionicons
                name="time-outline"
                size={40}
                color={colors.textTertiary}
              />
              <Text className="mt-3 text-sm text-gray-400 text-center">
                {t("stops.noDepartures")}
              </Text>
            </View>
          ) : null
        }
      />
    </BottomSheet>
  );
});
