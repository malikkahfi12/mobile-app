import "../../global.css";

import { ensureDeviceRegistered } from "@/services/auth/register";
import { restoreSession } from "@/services/auth/session";
import { configureGoogleSignIn } from "@/lib/googleSignIn";
import { QueryProvider } from "@/providers/QueryProvider";
import { Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toast } from "@/components/Toast";
import { useExitBackHandler } from "@/hooks/useExitBackHandler";

export default function RootLayout() {
  const pathname = usePathname();
  const isTabRoute = ["/home", "/explorer", "/profile"].includes(pathname);
  const { toastVisible, toastMessage, dismissToast } = useExitBackHandler(isTabRoute);

  useEffect(() => {
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
          <Stack.Screen name="settings" options={{ headerShown: true, title: "Settings" }} />
          <Stack.Screen name="recovery-security" options={{ headerShown: true, title: "Recovery & Security" }} />
          <Stack.Screen name="devices" options={{ headerShown: true, title: "Devices" }} />
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
