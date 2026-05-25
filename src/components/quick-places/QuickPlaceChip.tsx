import { memo } from "react";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { ICONS } from "./IconPicker";
import type { QuickPlace } from "@/types/quickPlaces.types";

interface QuickPlaceChipProps {
  place: QuickPlace;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function getIconName(place: QuickPlace): keyof typeof Ionicons.glyphMap {
  const found = ICONS.find((i) => i.key === place.icon);
  return found?.ionic ?? "location-outline";
}

export const QuickPlaceChip = memo(function QuickPlaceChip({
  place,
  isSelected,
  onPress,
  onLongPress,
}: QuickPlaceChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      className={`flex-row items-center rounded-xl px-3 py-2.5 ${
        isSelected ? "bg-primary/15" : "bg-gray-50"
      }`}
    >
      <Ionicons
        name={getIconName(place)}
        size={14}
        color={isSelected ? colors.primary : colors.textSecondary}
      />
      <Text
        className={`ml-1.5 text-xs font-medium ${
          isSelected ? "text-primary" : "text-gray-700"
        }`}
        numberOfLines={1}
        style={{ maxWidth: 100 }}
      >
        {place.name}
      </Text>
    </TouchableOpacity>
  );
});
