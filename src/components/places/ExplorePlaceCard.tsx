import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import type { ExplorePlaceItem } from "@/services/places/places.types";

interface ExplorePlaceCardProps {
  place: ExplorePlaceItem;
  distanceMeters?: number;
  onPress: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export const ExplorePlaceCard = memo(function ExplorePlaceCard({
  place,
  distanceMeters,
  onPress,
}: ExplorePlaceCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center border-b border-gray-50 px-4 py-3.5"
    >
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
        <Ionicons name="location" size={20} color={colors.primary} />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="text-[15px] font-semibold text-gray-900"
          numberOfLines={1}
        >
          {place.name}
        </Text>
        <View className="mt-0.5 flex-row items-center">
          <Text className="text-xs text-gray-400" numberOfLines={1}>
            {place.address}
          </Text>
        </View>
      </View>

      <View className="ml-2 flex-row items-center">
        {distanceMeters != null && (
          <Text className="text-xs text-gray-300">
            {formatDistance(distanceMeters)}
          </Text>
        )}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textTertiary}
          style={{ marginLeft: 8 }}
        />
      </View>
    </TouchableOpacity>
  );
});
