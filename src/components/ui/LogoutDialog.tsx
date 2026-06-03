import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface LogoutDialogProps {
  visible: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutDialog({
  visible,
  isLoading,
  onCancel,
  onConfirm,
}: LogoutDialogProps) {
  const [overlayOpacity] = useState(() => new Animated.Value(0));
  const [cardOpacity] = useState(() => new Animated.Value(0));
  const [cardScale] = useState(() => new Animated.Value(0.95));
  const animatingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      overlayOpacity.setValue(0);
      cardOpacity.setValue(0);
      cardScale.setValue(0.95);
    }
  }, [visible, overlayOpacity, cardOpacity, cardScale]);

  const animateOut = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      animatingRef.current = false;
      onCancel();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={isLoading ? undefined : animateOut}
    >
      <TouchableWithoutFeedback
        onPress={isLoading ? undefined : animateOut}
      >
        <Animated.View
          className="flex-1 items-center justify-center"
          style={{ opacity: overlayOpacity }}
        >
          <View className="absolute inset-0 bg-black/50" />
          <TouchableWithoutFeedback>
            <Animated.View
              className="mx-8 rounded-2xl bg-white px-6 pt-6 pb-7"
              style={{
                opacity: cardOpacity,
                transform: [{ scale: cardScale }],
              }}
            >
              <View className="items-center">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <Ionicons
                    name="log-out-outline"
                    size={28}
                    color={colors.error}
                  />
                </View>
              </View>

              <Text className="mt-4 text-center text-lg font-bold text-gray-900">
                Log Out
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-500">
                Are you sure you want to log out?
              </Text>

              <View className="mt-6 flex-row gap-4">
                <TouchableOpacity
                  onPress={animateOut}
                  disabled={isLoading}
                  activeOpacity={0.7}
                  className="flex-1 items-center rounded-xl border border-gray-200 px-4 py-3"
                >
                  <Text className="text-base font-semibold text-gray-700">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={isLoading}
                  activeOpacity={0.7}
                  className="flex-1 items-center rounded-xl bg-red-500 px-4 py-3"
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text className="text-base font-semibold text-white">
                      Log Out
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
