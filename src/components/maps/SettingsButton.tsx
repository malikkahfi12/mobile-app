import { memo } from "react";
import { TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  android: { elevation: 4 },
});

export const SettingsButton = memo(function SettingsButton() {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      className="absolute right-4 h-11 w-11 items-center justify-center rounded-full bg-white/90"
      style={[
        shadowStyle,
        { top: insets.top + 68 },
      ]}
      onPress={() => router.push("/settings")}
      activeOpacity={0.8}
      accessibilityLabel="Settings"
    >
      <Ionicons name="settings-outline" size={22} color="#1A1A1A" />
    </TouchableOpacity>
  );
});
