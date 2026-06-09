import { colors } from "@/constants/colors";
import { LOCALE_LABELS } from "@/lib/i18n";
import { useLocaleStore } from "@/store/locale.store";
import { LogoutDialog } from "@/components/ui/LogoutDialog";
import { logoutUser } from "@/services/auth/logout";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      router.replace("/onboarding");
    } finally {
      setIsLoggingOut(false);
      setLogoutVisible(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white">
        <Text className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {t("settings.account")}
        </Text>
        <SettingsRow
          icon="person-outline"
          iconColor={colors.primary}
          iconBg="bg-primary/10"
          label={t("settings.editProfile")}
          subtitle={t("settings.editProfileDesc")}
          onPress={() => router.push("/edit-profile" as Href)}
        />
        <View className="mx-4 border-b border-gray-100" />
        <SettingsRow
          icon="shield-checkmark-outline"
          iconColor={colors.success}
          iconBg="bg-green-100"
          label={t("settings.recoverySecurity")}
          subtitle={t("settings.recoverySecurityDesc")}
          onPress={() => router.push("/recovery-security")}
        />
        <View className="mx-4 border-b border-gray-100" />
        <SettingsRow
          icon="phone-portrait-outline"
          iconColor={colors.primary}
          iconBg="bg-primary/10"
          label={t("settings.devices")}
          subtitle={t("settings.devicesDesc")}
          onPress={() => router.push("/devices" as Href)}
        />
      </View>

      <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white">
        <Text className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {t("settings.preferences")}
        </Text>
        <SettingsRow
          icon="globe-outline"
          iconColor={colors.blue}
          iconBg="bg-blue-100"
          label={t("settings.language")}
          subtitle={LOCALE_LABELS[locale]}
          onPress={() => router.push("/language")}
        />
      </View>

      <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white">
        <SettingsRow
          icon="log-out-outline"
          iconColor={colors.error}
          iconBg="bg-red-100"
          label={t("logout.title")}
          onPress={() => setLogoutVisible(true)}
        />
      </View>

      <LogoutDialog
        visible={logoutVisible}
        isLoading={isLoggingOut}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
}
