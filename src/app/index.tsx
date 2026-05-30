import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function IndexRoute() {
  useEffect(() => {
    AsyncStorage.getItem("onboarding-complete").then((done) => {
      if (done === "true") {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    });
  }, []);

  return <View className="flex-1 bg-white" />;
}
