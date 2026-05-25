import { memo } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import type { QuickPlaceIcon } from "@/types/quickPlaces.types";

export const ICONS: { key: QuickPlaceIcon; label: string; ionic: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", ionic: "home-outline" },
  { key: "briefcase", label: "Work", ionic: "briefcase-outline" },
  { key: "school", label: "School", ionic: "school-outline" },
  { key: "heart", label: "Favorite", ionic: "heart-outline" },
  { key: "location", label: "Place", ionic: "location-outline" },
  { key: "train", label: "Station", ionic: "train-outline" },
  { key: "bus", label: "Bus Stop", ionic: "bus-outline" },
  { key: "pin", label: "Pin", ionic: "pin-outline" },
  { key: "cafe", label: "Cafe", ionic: "cafe-outline" },
  { key: "star", label: "Saved", ionic: "star-outline" },
];

interface IconPickerProps {
  selected: QuickPlaceIcon;
  onSelect: (icon: QuickPlaceIcon) => void;
}

export const IconPicker = memo(function IconPicker({
  selected,
  onSelect,
}: IconPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
    >
      {ICONS.map((item) => {
        const isSelected = selected === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onSelect(item.key)}
            activeOpacity={0.7}
            className={`h-11 w-11 items-center justify-center rounded-full ${
              isSelected ? "bg-primary/15 border border-primary/30" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name={item.ionic}
              size={20}
              color={isSelected ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});
