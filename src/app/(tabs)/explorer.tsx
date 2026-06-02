import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function ExplorerScreen() {
  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      <Ionicons name="compass-outline" size={64} color={colors.textTertiary} />
      <View className="h-6" />
      <Text className="text-2xl font-bold text-gray-800">Explorer</Text>
      <View className="h-2" />
      <Text className="text-base text-gray-400 text-center">Coming Soon</Text>
    </View>
  );
}
