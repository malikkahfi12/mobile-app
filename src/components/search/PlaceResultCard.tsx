import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SearchPlaceResult } from "@/services/search/search.types";
import { colors } from "@/constants/colors";

interface PlaceResultCardProps {
  place: SearchPlaceResult;
  onPress: () => void;
}

export const PlaceResultCard = memo(function PlaceResultCard({
  place,
  onPress,
}: PlaceResultCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center border-b border-gray-100 px-4 py-3"
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-amber-50">
        <Ionicons name="location" size={18} color={colors.warning} />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="text-[15px] font-semibold text-gray-900"
          numberOfLines={1}
        >
          {place.name}
        </Text>
        {place.address ? (
          <Text className="text-xs text-gray-400" numberOfLines={2}>
            {place.address}
          </Text>
        ) : null}
      </View>

      <View className="flex-row items-center">
        <View className="mr-2 rounded-full bg-amber-50 px-2 py-0.5">
          <Text className="text-[10px] font-semibold text-amber-600">
            Place
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
});
