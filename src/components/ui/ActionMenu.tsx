import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ActionMenuOption {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}

interface ActionMenuProps {
  visible: boolean;
  title?: string;
  options: ActionMenuOption[];
  cancelLabel?: string;
  onCancel: () => void;
}

export function ActionMenu({
  visible,
  title,
  options,
  cancelLabel = "Cancel",
  onCancel,
}: ActionMenuProps) {
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [slideTranslateY] = useState(() => new Animated.Value(300));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideTranslateY, {
          toValue: 0,
          damping: 24,
          stiffness: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      backdropOpacity.setValue(0);
      slideTranslateY.setValue(300);
    }
  }, [visible, backdropOpacity, slideTranslateY]);

  const handleCancel = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideTranslateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onCancel());
  };

  const handleOptionPress = (onPress: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideTranslateY, {
        toValue: 300,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onPress());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <Animated.View
          className="absolute inset-0 bg-black/50"
          style={{ opacity: backdropOpacity }}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        className="absolute bottom-0 left-0 right-0 px-4 pb-10"
        style={{ transform: [{ translateY: slideTranslateY }] }}
      >
        <View className="mb-3 overflow-hidden rounded-2xl bg-white">
          {title && (
            <Text className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {title}
            </Text>
          )}
          {options.map((option, index) => (
            <View key={option.label}>
              {index > 0 && (
                <View className="mx-4 border-b border-gray-50" />
              )}
              <TouchableOpacity
                onPress={() => handleOptionPress(option.onPress)}
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-3.5"
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={colors.textPrimary}
                  />
                </View>
                <Text className="ml-3 text-[15px] font-semibold text-gray-900">
                  {option.label}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleCancel}
          activeOpacity={0.7}
          className="h-12 items-center justify-center rounded-2xl bg-white"
        >
          <Text className="text-[15px] font-semibold text-red-500">
            {cancelLabel}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}
