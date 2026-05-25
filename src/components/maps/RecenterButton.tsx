import { memo, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecenterButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  hasError?: boolean;
}

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  android: { elevation: 4 },
});

export const RecenterButton = memo(function RecenterButton({
  onPress,
  isLoading = false,
  hasError = false,
}: RecenterButtonProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasError) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hasError, shakeAnim]);

  const shakeX = shakeAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -4, 4, -2, 0],
  });

  return (
    <Animated.View
      style={[
        shadowStyle,
        { transform: [{ translateX: shakeX }] },
      ]}
      className="absolute bottom-20 right-4"
    >
      <TouchableOpacity
        className={`h-11 w-11 items-center justify-center rounded-full bg-white ${
          hasError ? "border-2 border-red-400" : ""
        }`}
        onPress={onPress}
        disabled={isLoading}
        accessibilityLabel="Recenter map on your location"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#0EA5B7" />
        ) : (
          <Ionicons
            name="navigate"
            size={22}
            color={hasError ? "#EF4444" : "#1A1A1A"}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});
