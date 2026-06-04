import { memo, useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { NearbyStop } from "@/services/stops/stops.types";
import { colors } from "@/constants/colors";

interface StopCardProps {
  stop: NearbyStop;
  isSelected: boolean;
  onPress: (stop: NearbyStop) => void;
}

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export const StopCard = memo(function StopCard({
  stop,
  isSelected,
  onPress,
}: StopCardProps) {
  const { t } = useTranslation();
  const handlePress = useCallback(() => {
    onPress(stop);
  }, [onPress, stop]);
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`flex-row items-center px-4 py-3 ${
        isSelected ? "border-l-4 border-l-primary bg-primary/10" : "bg-white"
      }`}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          stop.isStation ? "bg-primary/20" : "bg-primary/10"
        }`}
      >
        <Ionicons
          name={stop.isStation ? "train-outline" : "bus-outline"}
          size={18}
          color={colors.primary}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-semibold text-gray-900" numberOfLines={1}>
          {stop.name}
        </Text>
        <Text className="text-xs text-gray-400" numberOfLines={1}>
          {stop.code}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-sm font-medium text-gray-500">
          {formatDistance(stop.distance_meters)}
        </Text>
        <View
          className={`mt-0.5 rounded-full px-2 py-0.5 ${
            stop.isStation ? "bg-primary/15" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-[10px] font-semibold ${
              stop.isStation ? "text-primary" : "text-gray-500"
            }`}
          >
            {stop.isStation ? t("common.station") : t("common.stop")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
