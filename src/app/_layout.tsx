import "../../global.css";

import { ensureDeviceRegistered } from "@/services/auth/register";
import { restoreSession } from "@/services/auth/session";
import { configureGoogleSignIn } from "@/lib/googleSignIn";
import { detectDeviceLocale, initI18n } from "@/lib/i18n";
import { QueryProvider } from "@/providers/QueryProvider";
import { Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toast } from "@/components/Toast";
import { useExitBackHandler } from "@/hooks/useExitBackHandler";

export default function RootLayout() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isTabRoute = ["/home", "/explorer", "/profile"].includes(pathname);
  const { toastVisible, toastMessage, dismissToast } = useExitBackHandler(isTabRoute);

  useEffect(() => {
    const deviceLocale = detectDeviceLocale();
    initI18n(deviceLocale);

    configureGoogleSignIn();

    async function boot() {
      await ensureDeviceRegistered();
      await restoreSession();
    }
    boot();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="settings" options={{ headerShown: true, title: t("navigation.settings") }} />
          <Stack.Screen name="recovery-security" options={{ headerShown: true, title: t("navigation.recoverySecurity") }} />
          <Stack.Screen name="devices" options={{ headerShown: true, title: t("navigation.devices") }} />
          <Stack.Screen name="language" options={{ headerShown: true, title: t("navigation.language") }} />
        </Stack>
        <Toast
          visible={toastVisible}
          message={toastMessage}
          onDismiss={dismissToast}
        />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
