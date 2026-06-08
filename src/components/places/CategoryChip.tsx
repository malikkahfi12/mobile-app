import { memo } from "react";
import { Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colors";
import type { PlaceCategory } from "@/services/places/places.types";
import { CATEGORIES } from "@/services/places/places.mock";

interface CategoryChipProps {
  selected: PlaceCategory;
  onSelect: (category: PlaceCategory) => void;
}

export const CategoryChip = memo(function CategoryChip({
  selected,
  onSelect,
}: CategoryChipProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      className="py-2"
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            activeOpacity={0.7}
            className={`flex-row items-center rounded-full px-3.5 py-2 ${
              isSelected ? "bg-primary" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={isSelected ? colors.white : colors.textSecondary}
            />
            <Text
              className={`ml-1.5 text-[13px] font-semibold ${
                isSelected ? "text-white" : "text-gray-500"
              }`}
            >
              {t(cat.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});
