import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGoogleRecoveryStore } from "@/store/googleRecovery.store";
import { useGoogleConnect } from "@/hooks/useGoogleConnect";
import {
  signInWithGoogle,
  changeGoogleAccount,
  getGoogleConnectErrorMessage,
  GoogleSignInError,
} from "@/lib/googleSignIn";

export default function RecoverySecurityScreen() {
  const googleEmail = useGoogleRecoveryStore((s) => s.googleEmail);
  const isConnected = useGoogleRecoveryStore((s) => s.isConnected);

  const connectMutation = useGoogleConnect();

  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    setErrorMessage(null);
    setIsConnecting(true);

    try {
      const idToken = await signInWithGoogle();
      await connectMutation.mutateAsync(idToken);
    } catch (error: unknown) {
      if (error instanceof GoogleSignInError && error.code === "CANCELLED") {
        return;
      }
      const msg = getGoogleConnectErrorMessage(error);
      if (msg) setErrorMessage(msg);
    } finally {
      setIsConnecting(false);
    }
  }, [connectMutation]);

  const handleChange = useCallback(async () => {
    setErrorMessage(null);
    setIsConnecting(true);

    try {
      const idToken = await changeGoogleAccount();
      await connectMutation.mutateAsync(idToken);
    } catch (error: unknown) {
      if (error instanceof GoogleSignInError && error.code === "CANCELLED") {
        return;
      }
      const msg = getGoogleConnectErrorMessage(error);
      if (msg) setErrorMessage(msg);
    } finally {
      setIsConnecting(false);
    }
  }, [connectMutation]);

  const isPending = isConnecting || connectMutation.isPending;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white">
        <Text className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Recovery
        </Text>

        <View className="px-4 py-3.5">
          <View className="flex-row items-center">
            <View
              className={`h-9 w-9 items-center justify-center rounded-full ${isConnected ? "bg-green-100" : "bg-gray-100"}`}
            >
              {isPending ? (
                <ActivityIndicator size={18} color={colors.primary} />
              ) : (
                <Ionicons
                  name="logo-google"
                  size={18}
                  color={isConnected ? colors.success : colors.textTertiary}
                />
              )}
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-semibold text-gray-900">
                Google Recovery
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                {isConnected
                  ? googleEmail
                  : "Google Recovery not connected"}
              </Text>
            </View>

            {isConnected ? (
              <TouchableOpacity
                onPress={handleChange}
                disabled={isPending}
                activeOpacity={0.7}
                className="rounded-xl border border-gray-200 px-3 py-1.5"
              >
                <Text className="text-[13px] font-semibold text-gray-700">
                  Change
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleConnect}
                disabled={isPending}
                activeOpacity={0.7}
                className="rounded-xl bg-primary px-4 py-2"
              >
                <Text className="text-[13px] font-semibold text-white">
                  Connect
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {errorMessage && !isPending && (
            <Text className="mt-2.5 text-[13px] leading-5 text-red-500">
              {errorMessage}
            </Text>
          )}
        </View>
      </View>

      <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white">
        <Text className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          How it works
        </Text>

        <View className="flex-row px-4 py-3.5">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.primary}
            />
          </View>
          <Text className="ml-3 flex-1 text-[13px] leading-5 text-gray-500">
            Google Recovery lets you regain access to your account even if you
            lose your device. Link a Google account to securely recover your
            Transitribe profile anytime.
          </Text>
        </View>
      </View>
    </View>
  );
}
