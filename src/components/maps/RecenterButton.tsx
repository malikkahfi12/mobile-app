import { memo, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colors";

interface RecenterButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  hasError?: boolean;
  isFollowing?: boolean;
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
  isFollowing = false,
}: RecenterButtonProps) {
  const { t } = useTranslation();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

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

  const iconName = isFollowing ? "navigate" : "navigate-outline";

  return (
    <Animated.View
      style={[
        shadowStyle,
        { transform: [{ translateX: shakeX }], bottom: insets.bottom + 160 },
      ]}
      className="absolute right-4"
    >
      <TouchableOpacity
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.white }}
        onPress={onPress}
        disabled={isLoading}
        accessibilityLabel={
          isFollowing
            ? t("accessibility.mapFollowing")
            : t("accessibility.recenterMap")
        }
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#1A1A1A" />
        ) : (
          <Ionicons name={iconName} size={22} color="#1A1A1A" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});
