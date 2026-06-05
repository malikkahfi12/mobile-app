import { colors } from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { logoutUser } from "@/services/auth/logout";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUIStore } from "@/store/ui.store";
import { useRouteStore } from "@/store/route.store";
import { useGuidanceStore } from "@/store/guidance.store";
import { LogoutDialog } from "@/components/ui/LogoutDialog";
import { useGoogleRecoveryStore } from "@/store/googleRecovery.store";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const user = useAuthStore((s) => s.user);

  const displayName = user?.displayName || "Traveler";
  const username = user?.username || "";
  const initials = user?.avatarInitials || displayName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.avatarUrl;
  const createdAt = user?.createdAt;

  const memberSinceYear = useMemo(() => {
    if (!createdAt) return null;
    return new Date(createdAt).getFullYear();
  }, [createdAt]);

  const handleOpenLogoutDialog = useCallback(() => {
    setShowLogoutDialog(true);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    setIsLoggingOut(true);
    useUIStore.getState().closeBottomSheet();
    useRouteStore.getState().clearSelection();
    useGuidanceStore.getState().endGuidance();
    useGoogleRecoveryStore.getState().clearGoogleEmail();
    await logoutUser();
    router.replace("/onboarding");
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View className="flex-1 bg-white pt-16">
        <View className="flex-row items-center justify-between px-4">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="h-11 w-11"
                  style={{ borderRadius: 22 }}
                />
              ) : (
                <Text className="text-sm font-bold text-primary">
                  {initials}
                </Text>
              )}
            </View>
            <View className="ml-3">
              <Text className="text-base font-bold text-gray-900">
                {displayName}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-xs text-gray-400">@{username}</Text>
                {memberSinceYear && (
                  <>
                    <Text className="text-xs text-gray-300 mx-1">·</Text>
                    <Text className="text-xs text-gray-400">
                      {t("profile.memberSince", { year: memberSinceYear })}
                    </Text>
                  </>
                )}
              </View>
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
