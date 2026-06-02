import "../../global.css";

import { ensureDeviceRegistered } from "@/services/auth/register";
import { restoreSession } from "@/services/auth/session";
import { QueryProvider } from "@/providers/QueryProvider";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toast } from "@/components/Toast";
import { useExitBackHandler } from "@/hooks/useExitBackHandler";

export default function RootLayout() {
  const { toastVisible, toastMessage, dismissToast } = useExitBackHandler();

  useEffect(() => {
    async function boot() {
      await ensureDeviceRegistered();
      await restoreSession();
    }
    boot();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryProvider>
        <Slot />
        <Toast
          visible={toastVisible}
          message={toastMessage}
          onDismiss={dismissToast}
        />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
