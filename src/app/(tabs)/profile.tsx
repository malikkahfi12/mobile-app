import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { logoutUser } from "@/services/auth/logout";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUIStore } from "@/store/ui.store";
import { useRouteStore } from "@/store/route.store";
import { useGuidanceStore } from "@/store/guidance.store";
import { LogoutDialog } from "@/components/ui/LogoutDialog";

export default function ProfileScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleOpenLogoutDialog = useCallback(() => {
    setShowLogoutDialog(true);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    setIsLoggingOut(true);
    useUIStore.getState().closeBottomSheet();
    useRouteStore.getState().clearSelection();
    useGuidanceStore.getState().endGuidance();
    await logoutUser();
    router.replace("/onboarding");
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View className="flex-1 bg-white pt-16">
        <View className="flex-row items-center justify-between px-4">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <Ionicons
                name="person-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <View className="ml-3">
              <Text className="text-base font-bold text-gray-900">
                Traveler
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                Member since 2026
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              activeOpacity={0.7}
              className="h-10 w-10 items-center justify-center rounded-full bg-primary/10"
            >
              <Ionicons
                name="settings-outline"
                size={19}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleOpenLogoutDialog}
              activeOpacity={0.7}
              className="h-10 w-10 items-center justify-center rounded-full bg-red-100"
            >
              <Ionicons
                name="log-out-outline"
                size={19}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <LogoutDialog
        visible={showLogoutDialog}
        isLoading={isLoggingOut}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
      />
    </SafeAreaView>
  );
}
