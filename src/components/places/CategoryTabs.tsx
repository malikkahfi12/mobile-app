import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colors";
import type { PlaceCategory } from "@/services/places/places.types";

const TABS: { key: PlaceCategory; icon: string; labelKey: string }[] = [
  { key: "coffee", icon: "cafe-outline", labelKey: "explorer.categories.coffee" },
  { key: "food", icon: "restaurant-outline", labelKey: "explorer.categories.food" },
  { key: "shopping", icon: "cart-outline", labelKey: "explorer.categories.shopping" },
  { key: "parks", icon: "leaf-outline", labelKey: "explorer.categories.parks" },
];

interface CategoryTabsProps {
  selected: PlaceCategory;
  onSelect: (category: PlaceCategory) => void;
}

export const CategoryTabs = memo(function CategoryTabs({
  selected,
  onSelect,
}: CategoryTabsProps) {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row bg-white px-3 py-2 gap-2"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      {TABS.map((tab) => {
        const isSelected = selected === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            activeOpacity={0.7}
            className={`flex-1 flex-row items-center justify-center rounded-full py-2 ${
              isSelected ? "bg-primary" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name={tab.icon as any}
              size={14}
              color={isSelected ? colors.white : colors.textSecondary}
            />
            <Text
              className={`ml-1 text-[12px] font-semibold ${
                isSelected ? "text-white" : "text-gray-500"
              }`}
              numberOfLines={1}
            >
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});
