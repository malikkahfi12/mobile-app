import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUIStore } from "@/store/ui.store";
import { useRouteStore } from "@/store/route.store";

export const SearchBarOverlay = memo(function SearchBarOverlay() {
  const insets = useSafeAreaInsets();
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);

  return (
    <TouchableOpacity
      className="absolute left-4 right-4 rounded-xl bg-white/90 px-4 py-3 shadow-sm"
      style={{ top: insets.top + 12 }}
      onPress={() => {
        useRouteStore.getState().setSelectedStop(null);
        setBottomSheet("planner");
      }}
      activeOpacity={0.9}
    >
      <View className="flex-row items-center">
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <Text className="ml-2 flex-1 text-base text-gray-400">Plan a route...</Text>
      </View>
    </TouchableOpacity>
  );
});
