import { usePlaceDetail } from "@/hooks/places/usePlaceDetail";
import { useExplorerStore } from "@/store/explorer.store";
import { useUIStore } from "@/store/ui.store";
import { Ionicons } from "@expo/vector-icons";
import { ModalBottomSheet } from "@swmansion/react-native-bottom-sheet";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { usePlannerFromPlace } from "@/hooks/places/usePlannerFromPlace";
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_BOTTOM_MARGIN,
} from "@/components/navigation/FloatingTabBar";

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export const PlaceDetailSheet = memo(function PlaceDetailSheet() {
  const { t } = useTranslation();
  const closeBottomSheet = useUIStore((s) => s.closeBottomSheet);
  const selectedPlace = useExplorerStore((s) => s.selectedPlace);
  const setSelectedPlace = useExplorerStore((s) => s.setSelectedPlace);
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = usePlaceDetail(
    selectedPlace?.id,
    selectedPlace?.id ? undefined : selectedPlace?.name,
    selectedPlace?.id ? undefined : selectedPlace?.lat,
    selectedPlace?.id ? undefined : selectedPlace?.lng,
  );

  const place = data?.data;

  const [prevPlace, setPrevPlace] = useState(selectedPlace);
  if (selectedPlace !== prevPlace) {
    setPrevPlace(selectedPlace);
    if (selectedPlace) {
      setIndex(1);
    }
  }

  const handleSettle = useCallback(
    (nextIndex: number) => {
      if (nextIndex === 0) {
        setSelectedPlace(null);
        closeBottomSheet();
      }
    },
    [setSelectedPlace, closeBottomSheet],
  );

  const handleClose = useCallback(() => {
    setIndex(0);
  }, []);

  const { handleRouteHere, isRouting } = usePlannerFromPlace(
    place ?? null,
  );

  const handleOpenInMaps = useCallback(() => {
    if (!place) return;
    const { lat, lng, name } = place;
    const label = encodeURIComponent(name);
    const url = Platform.select({
      ios: `maps:?q=${label}&ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });
    if (url) Linking.openURL(url);
  }, [place]);

  const showLoading = isLoading && !data;

  return (
    <ModalBottomSheet
      index={index}
      onIndexChange={setIndex}
      onSettle={handleSettle}
      detents={[0, 400, "content"]}
      scrimColor="rgba(0, 0, 0, 0.15)"
      surface={
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.white,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          ]}
        />
      }
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + 24 }}
      >
        {showLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-3 text-sm text-gray-400">
              {t("common.loading")}
            </Text>
          </View>
        ) : isError && !isLoading ? (
          <View className="items-center px-4 py-16">
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={colors.error}
            />
            <Text className="mt-3 text-sm text-gray-500 text-center">
              {t("explorer.detailFailed")}
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
        ) : place ? (
          <>
            <View className="px-4 pt-6 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Ionicons
                    name="location"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {place.name}
                  </Text>
                  <Text className="text-xs text-gray-400" numberOfLines={2}>
                    {place.address}
                  </Text>
                </View>
              </View>
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

            {place.nearestStop ? (
              <View className="mx-4 mt-3 rounded-2xl bg-blue-50 p-4 border border-blue-100">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <Ionicons
                      name="bus-outline"
                      size={18}
                      color="#2563EB"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-[13px] font-semibold text-gray-800">
                      {place.nearestStop.name}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {t("explorer.nearestStop")} ·{" "}
                      {formatDistance(place.nearestStop.distanceMeters)}{" "}
                      {t("common.walk").toLowerCase()}
                    </Text>
                  </View>
                  <Ionicons
                    name="walk-outline"
                    size={20}
                    color="#2563EB"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleRouteHere}
                  disabled={isRouting}
                  activeOpacity={0.7}
                  className={`mt-3 flex-row items-center justify-center rounded-xl bg-primary py-3 ${
                    isRouting ? "opacity-50" : ""
                  }`}
                >
                  <Ionicons
                    name="navigate-outline"
                    size={18}
                    color={colors.white}
                  />
                  <Text className="ml-2 text-sm font-bold text-white">
                    {t("explorer.routeToPlace")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mx-4 mt-3 rounded-2xl bg-gray-50 p-4 items-center border border-gray-100">
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color={colors.textTertiary}
                />
                <Text className="mt-2 text-sm text-gray-400 text-center">
                  {t("explorer.noTransitNearby")}
                </Text>
              </View>
            )}

            <View className="mx-4 mt-4">
              <TouchableOpacity
                onPress={handleOpenInMaps}
                className="flex-row items-center justify-center rounded-xl border border-gray-200 py-2.5"
                activeOpacity={0.7}
              >
                <Ionicons
                  name="map-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text className="ml-1.5 text-[13px] font-semibold text-gray-500">
                  {t("explorer.openInMaps")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </ScrollView>
    </ModalBottomSheet>
  );
});
