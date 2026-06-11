import { useCallback, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colors";

export const TAB_BAR_HEIGHT = 0;
export const TAB_BAR_BOTTOM_MARGIN = 0;

type TabRoute = "explorer" | "home";

interface TabItem {
  route: TabRoute;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
}

const TABS: TabItem[] = [
  {
    route: "home",
    icon: "map-outline",
    activeIcon: "map",
    labelKey: "navigation.home",
  },
  {
    route: "explorer",
    icon: "compass-outline",
    activeIcon: "compass",
    labelKey: "navigation.explorer",
  },
];

export function FloatingTabBar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const activeRoute = useMemo<TabRoute>(() => {
    if (pathname.includes("/explorer")) return "explorer";
    return "home";
  }, [pathname]);

  const handlePress = useCallback((route: TabRoute) => {
    if (pathname.includes(route)) return;
    router.replace(`/(tabs)/${route}` as any);
  }, [pathname]);

  return (
    <View
      className="absolute left-0 right-0"
      style={{ bottom: insets.bottom }}
    >
      <View
          className="flex-row items-center bg-white shadow-2xl"
          style={{
            height: 64,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          {TABS.map((tab) => (
            <SideTab
              key={tab.route}
              item={tab}
              isActive={activeRoute === tab.route}
              onPress={() => handlePress(tab.route)}
              t={t}
            />
          ))}
        </View>
    </View>
  );
}

function SideTab({
  item,
  isActive,
  onPress,
  t,
}: {
  item: TabItem;
  isActive: boolean;
  onPress: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const iconName = isActive ? item.activeIcon : item.icon;
  const iconColor = isActive ? colors.primary : colors.textTertiary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      className="flex-1 items-center justify-center py-2"
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={t(item.labelKey)}
    >
      <Ionicons name={iconName} size={22} color={iconColor} />
      <Text
        className={`text-[10px] mt-0.5 ${
          isActive ? "font-semibold text-primary" : "text-gray-400"
        }`}
      >
        {t(item.labelKey)}
      </Text>
    </TouchableOpacity>
  );
}
