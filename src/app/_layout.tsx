import "../../global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryProvider } from "@/providers/QueryProvider";
import HomeScreen from "./home";

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <QueryProvider>
        <HomeScreen />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
