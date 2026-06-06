import { useCallback, memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { useGuidanceStore } from "@/store/guidance.store";
import { useQuickRoute } from "@/hooks/useQuickRoute";
import { useNearbyStops } from "@/hooks/stops/useNearbyStops";
import { colors } from "@/constants/colors";

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export const FloatingStopCard = memo(function FloatingStopCard() {
  const { t } = useTranslation();
  const selectedStop = useRouteStore((s) => s.selectedStop);
  const setSelectedStop = useRouteStore((s) => s.setSelectedStop);
  const bottomSheetContent = useUIStore((s) => s.bottomSheetContent);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);
  const isGuidanceActive = useGuidanceStore((s) => s.isActive);
  const { data: nearbyStops } = useNearbyStops();
  const { routeToHere, isRouting } = useQuickRoute(
    selectedStop,
    nearbyStops,
  );

  const handleClose = useCallback(() => {
    setSelectedStop(null);
  }, [setSelectedStop]);

  const handleViewDetails = useCallback(() => {
    setBottomSheet("stopDetail");
  }, [setBottomSheet]);

  if (
    !selectedStop ||
    isGuidanceActive ||
    bottomSheetContent !== "none"
  ) {
    return null;
  }

  return (
    <View
      className="absolute left-4 right-4 rounded-2xl border border-gray-100 bg-white shadow-lg"
      style={{ bottom: "14%" }}
    >
      <View className="px-4 py-3">
        <View className="flex-row items-center">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Ionicons
              name={selectedStop.isStation ? "train-outline" : "bus-outline"}
              size={16}
              color={colors.primary}
            />
          </View>
          <Text
            className="ml-2 flex-1 text-base font-bold text-gray-900"
            numberOfLines={1}
          >
            {selectedStop.name}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View className="ml-10 mt-1 flex-row items-center">
          <View
            className={`rounded-full px-2 py-0.5 ${
              selectedStop.isStation ? "bg-primary/15" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-[10px] font-semibold ${
                selectedStop.isStation ? "text-primary" : "text-gray-500"
              }`}
            >
              {selectedStop.isStation ? t("common.station") : t("common.stop")}
            </Text>
          </View>
          <Text className="ml-2 text-xs text-gray-400">
            · {formatDistance(selectedStop.distance_meters)}
          </Text>
        </View>

        <View className="ml-10 mt-2.5 flex-row gap-2">
          <TouchableOpacity
            onPress={routeToHere}
            disabled={isRouting}
            activeOpacity={0.7}
            className={`flex-1 flex-row items-center justify-center rounded-lg bg-primary/15 py-2 ${
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
            onPress={handleViewDetails}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center rounded-lg border border-primary/30 py-2"
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.primary}
            />
            <Text className="ml-1 text-xs font-semibold text-primary">
              {t("common.viewDetails")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
