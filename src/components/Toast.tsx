import { useEffect, useState } from "react";
import { Animated, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({
  visible,
  message,
  duration = 2000,
  onDismiss,
}: ToastProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(20));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute left-4 right-4 rounded-xl bg-black/80 px-5 py-3.5"
      style={{
        bottom: insets.bottom + 100,
        opacity,
        transform: [{ translateY }],
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}
      pointerEvents="none"
    >
      <Text className="text-center text-sm font-medium text-white">
        {message}
      </Text>
    </Animated.View>
  );
}
