import { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { StopWithDepartures } from "@/services/stops/stops.types";
import { colors } from "@/constants/colors";

interface StopHeaderProps {
  stop: StopWithDepartures;
  distanceMeters?: number;
}

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export const StopHeader = memo(function StopHeader({
  stop,
  distanceMeters,
}: StopHeaderProps) {
  return (
    <View className="px-4 pt-6 pb-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <View
          className={`h-12 w-12 items-center justify-center rounded-full ${
            stop.isStation ? "bg-primary/20" : "bg-primary/10"
          }`}
        >
          <Ionicons
            name={stop.isStation ? "train-outline" : "bus-outline"}
            size={22}
            color={colors.primary}
          />
        </View>

        <View className="ml-3 flex-1">
          <Text
            className="text-2xl font-bold text-gray-900"
            numberOfLines={2}
          >
            {stop.name}
          </Text>
          {stop.code ? (
            <Text className="mt-1 text-sm text-gray-400">{stop.code}</Text>
          ) : null}
        </View>
      </View>

      <View className="mt-3 flex-row items-center">
        <View
          className={`rounded-full px-3 py-1 ${
            stop.isStation ? "bg-primary/15" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              stop.isStation ? "text-primary" : "text-gray-500"
            }`}
          >
            {stop.isStation ? "Station" : "Stop"}
          </Text>
        </View>

        {distanceMeters != null && distanceMeters > 0 && (
          <Text className="ml-3 text-xs text-gray-400">
            · {formatDistance(distanceMeters)}
          </Text>
        )}

        {stop.locationType != null && (
          <Text className="ml-3 text-xs text-gray-400">
            · Type {stop.locationType}
          </Text>
        )}
      </View>
    </View>
  );
});
