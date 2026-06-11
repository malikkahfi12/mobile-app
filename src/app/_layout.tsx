import "../../global.css";

import { Toast } from "@/components/Toast";
import { useExitBackHandler } from "@/hooks/useExitBackHandler";
import { configureGoogleSignIn } from "@/lib/googleSignIn";
import "@/lib/i18n";
import { QueryProvider } from "@/providers/QueryProvider";
import { ensureDeviceKeypair } from "@/services/auth/deviceIdentity";
import { restoreSession } from "@/services/auth/session";
import { useAuthStore } from "@/store/auth.store";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const { t } = useTranslation();
  const { toastVisible, toastMessage, dismissToast } = useExitBackHandler(true);

  useEffect(() => {
    configureGoogleSignIn();

    async function boot() {
      try {
        await ensureDeviceKeypair();
        await restoreSession();
      } catch {

      } finally {
        const state = useAuthStore.getState();
        state.setLoading(false);

        if (!state.isAuthenticated) {
          router.replace("/onboarding");
        }
      }
    }
    boot();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="home" />
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
