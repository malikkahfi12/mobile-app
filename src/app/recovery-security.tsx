import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function RecoverySecurityScreen() {
  return (
    <View className="flex-1 bg-gray-50 justify-center items-center px-8">
      <Ionicons
        name="shield-checkmark-outline"
        size={64}
        color={colors.success}
      />
      <View className="h-6" />
      <Text className="text-2xl font-bold text-gray-800">
        Recovery & Security
      </Text>
      <View className="h-2" />
      <Text className="text-base text-gray-400 text-center">
        Manage your account recovery and security settings.
      </Text>
    </View>
  );
}
