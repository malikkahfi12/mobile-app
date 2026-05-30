import { secureStore } from "@/services/auth/secureStore";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function IndexRoute() {
  useEffect(() => {
    secureStore.getOnboardingCompleted().then((done) => {
      if (done) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    });
  }, []);

  return <View className="flex-1 bg-white" />;
}
