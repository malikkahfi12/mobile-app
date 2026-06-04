import { memo, useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/app.store";

const BANNER_HEIGHT = 32;

export const OfflineBanner = memo(function OfflineBanner() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isOnline = useAppStore((s) => s.isOnline);
  const opacity = useRef(new Animated.Value(0)).current;
  const prevOnline = useRef(isOnline);

  useEffect(() => {
    if (prevOnline.current === isOnline) return;
    prevOnline.current = isOnline;

    Animated.timing(opacity, {
      toValue: isOnline ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOnline, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: insets.top,
        left: 0,
        right: 0,
        height: BANNER_HEIGHT,
        backgroundColor: "#F59E0B",
        opacity,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <View className="flex-row items-center">
        <Ionicons name="cloud-offline-outline" size={14} color="#78350F" />
        <Text className="ml-1.5 text-[11px] font-semibold text-amber-900">
          {t("common.noInternet")}
        </Text>
      </View>
    </Animated.View>
  );
});
