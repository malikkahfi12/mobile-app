import { images } from "@/constants/images";
import { ensureDeviceKeypair } from "@/services/auth/deviceIdentity";
import { ensureDeviceRegistered } from "@/services/auth/register";
import { loginWithDeviceChallenge } from "@/services/auth/login";
import { secureStore } from "@/services/auth/secureStore";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Platform, Pressable, Text, View } from "react-native";
import { recoverWithGoogle } from "@/services/auth/recovery";
import { GoogleSignInError } from "@/lib/googleSignIn";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lockedRef = useRef(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const handleContinueWithGoogle = useCallback(async () => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await recoverWithGoogle();
      await secureStore.setOnboardingCompleted();
      router.replace("/home");
    } catch (err: unknown) {
      console.error("[ONBOARDING] Recovery failed:", (err as Error)?.constructor?.name, (err as Error)?.message, (err as any)?.code);
      if (err instanceof GoogleSignInError && err.code === "CANCELLED") {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
      lockedRef.current = false;
    }
  }, []);

  const handleBackFromRecovery = useCallback(() => {
    setError(null);
    setShowRecovery(false);
  }, []);

  const handleGetStarted = useCallback(async () => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await ensureDeviceKeypair();
      await ensureDeviceRegistered();
      await loginWithDeviceChallenge();

      await secureStore.setOnboardingCompleted();
      router.replace("/home");
    } catch (err) {
      console.error("[ONBOARDING] GetStarted failed:", (err as Error)?.constructor?.name, (err as Error)?.message);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
      lockedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android" || !showRecovery) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setShowRecovery(false);
      return true;
    });

    return () => sub.remove();
  }, [showRecovery]);

  if (showRecovery) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <Pressable
          onPress={handleBackFromRecovery}
          className="px-4 py-3 self-start"
        >
          <Text className="text-base font-semibold text-[#F28500]">← Back</Text>
        </Pressable>

        <View
          className="flex-1 justify-center px-8"
          style={{ paddingBottom: insets.bottom + 32 }}
        >
          <Text className="text-4xl font-extrabold text-[#1F2937] text-center leading-tight">
            Recover your account
          </Text>

          <View className="h-4" />

          <Text className="text-base text-gray-400 text-center leading-relaxed tracking-wide px-4">
            If you previously connected a Google account, you can recover your
            Transitribe profile here.
          </Text>

          <View className="h-8" />

          {error && (
            <View className="mx-6 mb-4 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm text-red-600 text-center">{error}</Text>
              <Text
                className="text-sm font-semibold text-red-600 text-center mt-2"
                onPress={handleContinueWithGoogle}
              >
                Tap to retry
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleContinueWithGoogle}
            disabled={isLoading}
            className="mx-6 bg-[#F28500] rounded-full py-4 items-center shadow-lg shadow-black/[0.08]"
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-lg font-semibold tracking-wide">
                Continue with Google
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

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
        {error && (
          <View className="mx-6 mb-4 rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-600 text-center">{error}</Text>
            <Text
              className="text-sm font-semibold text-red-600 text-center mt-2"
              onPress={handleGetStarted}
            >
              Tap to retry
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleGetStarted}
          disabled={isLoading}
          className="mx-6 bg-[#F28500] rounded-full py-4 items-center shadow-lg shadow-black/[0.08]"
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-lg font-semibold tracking-wide">
              Get Started
            </Text>
          )}
        </Pressable>

        <View className="flex-row justify-center mt-6">
          <Text className="text-sm text-gray-400">Already have an account? </Text>
          <Text
            className="text-sm font-semibold text-[#F28500]"
            onPress={() => {
              setError(null);
              setShowRecovery(true);
            }}
          >
            Recover Account
          </Text>
        </View>
      </View>
    </View>
  );
}
