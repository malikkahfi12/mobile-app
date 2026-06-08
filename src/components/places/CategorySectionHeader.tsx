import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colors";
import { CATEGORIES } from "@/services/places/places.mock";
import type { PlaceCategory } from "@/services/places/places.types";

interface CategorySectionHeaderProps {
  categoryKey: PlaceCategory;
  count: number;
  onSeeAll: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {};
const CATEGORY_LABELS: Record<string, string> = {};

for (const cat of CATEGORIES) {
  CATEGORY_ICONS[cat.key] = cat.icon;
  CATEGORY_LABELS[cat.key] = cat.labelKey;
}

export const CategorySectionHeader = memo(function CategorySectionHeader({
  categoryKey,
  count,
  onSeeAll,
}: CategorySectionHeaderProps) {
  const { t } = useTranslation();
  const iconName = CATEGORY_ICONS[categoryKey] ?? "grid-outline";
  const label = t(CATEGORY_LABELS[categoryKey] ?? "explorer.categories.all");

  return (
    <View className="flex-row items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
      <View className="flex-row items-center">
        <Ionicons name={iconName as any} size={16} color={colors.primary} />
        <Text className="ml-2 text-[13px] font-semibold text-gray-700">
          {label}
        </Text>
        <Text className="ml-1.5 text-[11px] text-gray-400">
          ({count})
        </Text>
      </View>
      <TouchableOpacity
        onPress={onSeeAll}
        activeOpacity={0.7}
        className="flex-row items-center"
      >
        <Text className="text-[12px] font-semibold text-primary">
          {t("explorer.seeAll")}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={14}
          color={colors.primary}
          style={{ marginLeft: 2 }}
        />
      </TouchableOpacity>
    </View>
  );
});
