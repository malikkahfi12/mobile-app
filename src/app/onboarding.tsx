import { images } from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  const handleGetStarted = useCallback(async () => {
    await AsyncStorage.setItem("onboarding-complete", "true");
    router.replace("/home");
  }, []);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-1 justify-center px-8">
        <Text className="text-4xl font-extrabold text-[#1F2937] text-center leading-tight">
          Connect the Dots.{"\n"}Share the Spots.
        </Text>

        <View className="h-12" />

        <View className="items-center">
          <Image
            source={images.adventureMap}
            style={{ width: "100%", height: 256 }}
            contentFit="contain"
          />
        </View>

        <View className="h-12" />

        <Text className="text-base text-gray-400 text-center leading-relaxed tracking-wide px-4">
          Discover places, navigate transit, and explore together.
        </Text>
      </View>

      <View style={{ paddingBottom: insets.bottom + 32 }}>
        <Pressable
          onPress={handleGetStarted}
          className="mx-6 bg-[#F28500] rounded-full py-4 items-center shadow-lg shadow-black/[0.08] active:bg-[#D97300]"
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text className="text-white text-lg font-semibold tracking-wide">
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
