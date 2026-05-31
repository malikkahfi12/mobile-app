import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { logoutUser } from "@/services/auth/logout";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUIStore } from "@/store/ui.store";
import { useRouteStore } from "@/store/route.store";
import { useGuidanceStore } from "@/store/guidance.store";

interface ProfileCardProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}

function ProfileCard({ icon, label, onPress }: ProfileCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white px-4 py-3.5"
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-semibold text-gray-900">
          {label}
        </Text>
      </View>
      <View className="rounded-full bg-gray-100 px-2 py-0.5">
        <Text className="text-[10px] font-medium text-gray-400">
          Coming Soon
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.textTertiary}
        className="ml-2"
      />
    </TouchableOpacity>
  );
}

const CARDS = [
  { icon: "bookmark-outline" as const, label: "Saved Places" },
  { icon: "time-outline" as const, label: "Recent Journeys" },
  { icon: "phone-portrait-outline" as const, label: "Devices" },
  { icon: "settings-outline" as const, label: "Settings" },
];

export default function ProfileScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleComingSoon = useCallback(() => {
    Alert.alert("Coming Soon", "This feature will be available in a future update.");
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          useUIStore.getState().closeBottomSheet();
          useRouteStore.getState().clearSelection();
          useGuidanceStore.getState().endGuidance();
          await logoutUser();
          router.replace("/onboarding");
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white px-4 pb-2 pt-8">
          <View className="items-center">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Ionicons
                name="person-outline"
                size={44}
                color={colors.primary}
              />
            </View>
            <Text className="mt-4 text-xl font-bold text-gray-900">
              Traveler
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              Member since 2026
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-100 bg-white">
          {CARDS.map((card, index) => (
            <View key={card.label}>
              <ProfileCard
                icon={card.icon}
                label={card.label}
                onPress={handleComingSoon}
              />
              {index < CARDS.length - 1 && (
                <View className="mx-4 border-b border-gray-100" />
              )}
            </View>
          ))}
        </View>

        <View className="mx-4 mt-8 border-t border-gray-100" />

        <View className="px-4 pb-8 pt-6">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.7}
            className="items-center rounded-xl border border-red-200 px-6 py-3.5"
          >
            {isLoggingOut ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text className="text-base font-semibold text-red-500">
                Log Out
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
