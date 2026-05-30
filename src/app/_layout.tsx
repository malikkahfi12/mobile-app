import "../../global.css";

import { ensureDeviceRegistered } from "@/services/auth/register";
import { restoreSession } from "@/services/auth/session";
import { QueryProvider } from "@/providers/QueryProvider";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
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
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
