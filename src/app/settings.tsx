import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  iconBg: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
}

function SettingsRow({
  icon,
  iconColor,
  iconBg,
  label,
  subtitle,
  onPress,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3.5"
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${iconBg}`}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-semibold text-gray-900">
          {label}
        </Text>
        {subtitle && (
          <Text className="mt-0.5 text-xs text-gray-400">{subtitle}</Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.textTertiary}
      />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white">
        <Text className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Account
        </Text>
        <SettingsRow
          icon="shield-checkmark-outline"
          iconColor={colors.success}
          iconBg="bg-green-100"
          label="Recovery & Security"
          subtitle="Password, recovery codes, and 2FA"
          onPress={() => router.push("/recovery-security")}
        />
        <View className="mx-4 border-b border-gray-100" />
        <SettingsRow
          icon="phone-portrait-outline"
          iconColor={colors.primary}
          iconBg="bg-primary/10"
          label="Devices"
          subtitle="Manage connected devices and sessions"
          onPress={() => router.push("/devices" as Href)}
        />
      </View>
    </View>
  );
}
