import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
        <Ionicons
          name="person-outline"
          size={48}
          color={colors.textTertiary}
        />
      </View>
      <View className="h-4" />
      <Text className="text-xl font-semibold text-gray-800">Rider</Text>
      <View className="h-6" />
      <View className="w-full border-t border-gray-100" />
      <View className="h-4" />
      <Text className="text-sm text-gray-400 text-center">
        Saved Places, Devices, Settings — Coming Soon
      </Text>
    </View>
  );
}
