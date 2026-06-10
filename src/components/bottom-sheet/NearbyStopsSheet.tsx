import { useCallback, useEffect, useMemo, useRef, memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import BottomSheet, {
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { StopCard } from "./StopCard";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { useLocationStore } from "@/store/location.store";
import { colors } from "@/constants/colors";
import { TAB_BAR_HEIGHT, TAB_BAR_BOTTOM_MARGIN } from "@/components/navigation/FloatingTabBar";
import type { NearbyStop } from "@/services/stops/stops.types";

interface NearbyStopsSheetProps {
  stops: NearbyStop[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const EMPTY_ARRAY: NearbyStop[] = [];

export const NearbyStopsSheet = memo(function NearbyStopsSheet({
  stops,
  isLoading,
  isError,
  onRetry,
}: NearbyStopsSheetProps) {
  const { t } = useTranslation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const selectedStop = useRouteStore((s) => s.selectedStop);
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN;

  const snapPoints = useMemo(() => ["8%", "45%"], []);
  const currentLocation = useLocationStore((s) => s.currentLocation);

  useEffect(() => {
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  useEffect(() => {
    if (selectedStop) {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [selectedStop]);

  const handleStopPress = useCallback((stop: NearbyStop) => {
    const { selectedStop: curr, setSelectedStop: set } =
      useRouteStore.getState();
    if (curr?.id === stop.id) {
      set(null);
      useUIStore.getState().closeBottomSheet();
    } else {
      set(stop);
      useUIStore.getState().setBottomSheet("stopDetail");
    }
  }, []);

  const showWaiting = !isLoading && !isError && !stops && !currentLocation;
  const isEmpty = !isLoading && !isError && (!stops || stops.length === 0) && !showWaiting;
  const hasStaleData = stops && stops.length > 0;
  const showError = isError && !isLoading;

  const renderItem = useCallback(
    ({ item }: { item: NearbyStop }) => (
      <StopCard
        stop={item}
        isSelected={selectedStop?.id === item.id}
        onPress={handleStopPress}
      />
    ),
    [selectedStop, handleStopPress],
  );

  const keyExtractor = useCallback((item: NearbyStop) => item.id, []);

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
      <BottomSheetFlatList
        data={stops ?? EMPTY_ARRAY}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={
          <View className="px-4 pb-2 pt-3">
            <Text className="text-base font-bold text-gray-900">
              {t("stops.nearbyStops")}
            </Text>
            {isLoading && (
              <Text className="mt-1 text-xs text-gray-400">{t("common.loading")}</Text>
            )}
            {showWaiting && (
              <Text className="mt-1 text-xs text-gray-400">{t("stops.gettingLocation")}</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <>
            {showError && !hasStaleData && (
              <View className="items-center px-4 py-8">
                <Ionicons
                  name="cloud-offline-outline"
                  size={36}
                  color={colors.textTertiary}
                />
                <Text className="mt-2 text-sm text-gray-500 text-center">
                  {t("stops.cachedWarning")}
                </Text>
                {onRetry && (
                  <TouchableOpacity
                    onPress={onRetry}
                    className="mt-3 rounded-full bg-primary px-6 py-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-semibold text-white">
                      {t("common.retryTap")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {showWaiting && (
              <View className="items-center px-4 py-8">
                <Ionicons
                  name="location-outline"
                  size={36}
                  color={colors.textTertiary}
                />
                <Text className="mt-2 text-sm text-gray-500 text-center">
                  {t("stops.gettingLocation")}
                </Text>
              </View>
            )}
            {isEmpty && !showError && (
              <View className="items-center px-4 py-8">
                <Text className="text-sm text-gray-400">
                  {t("stops.noStopsNearby")}
                </Text>
              </View>
            )}
          </>
        }
      />
      {showError && hasStaleData && (
        <View
          className="absolute left-0 right-0 bg-amber-50 px-4 py-2 border-t border-amber-100"
          style={{ bottom: insets.bottom }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons
              name="time-outline"
              size={12}
              color="#B45309"
            />
            <Text className="ml-1.5 text-[11px] text-amber-700">
              {t("stops.cachedWarning")}
            </Text>
            {onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                className="ml-3 rounded-full bg-amber-100 px-3 py-1"
                activeOpacity={0.7}
              >
                <Text className="text-[11px] font-semibold text-amber-800">
                  {t("stops.staleRetry")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </BottomSheet>
  );
});
