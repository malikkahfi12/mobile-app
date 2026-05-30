import "../../global.css";

import { QueryProvider } from "@/providers/QueryProvider";
import { apiConfig } from "@/services/api/config";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import HomeScreen from "./home";

export default function RootLayout() {
  useEffect(() => {
    console.log("API Endpoint:", apiConfig.apiUrl);
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryProvider>
        <HomeScreen />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
