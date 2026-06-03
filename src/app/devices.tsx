import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import type { DeviceInfo } from "@/types/auth.types";
import { useDevices } from "@/hooks/useDevices";
import { getPlatformIcon, getPlatformLabel, formatLastSeen } from "@/lib/device.helpers";
import { RevokeDeviceSheet } from "@/components/bottom-sheet/RevokeDeviceSheet";

function SkeletonRow() {
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View className="flex-row items-center px-4 py-3.5">
      <Animated.View
        className="h-9 w-9 rounded-full bg-gray-200"
        style={{ opacity }}
      />
      <View className="ml-3 flex-1 gap-1.5">
        <Animated.View
          className="h-4 w-32 rounded bg-gray-200"
          style={{ opacity }}
        />
        <Animated.View
          className="h-3 w-24 rounded bg-gray-200"
          style={{ opacity }}
        />
      </View>
    </View>
  );
}

function DeviceRow({
  device,
  onPress,
}: {
  device: DeviceInfo;
  onPress: (device: DeviceInfo) => void;
}) {
  const isCurrent = device.isCurrent;

  return (
    <TouchableOpacity
      onPress={() => !isCurrent && onPress(device)}
      disabled={isCurrent}
      activeOpacity={isCurrent ? 1 : 0.7}
      className="flex-row items-center px-4 py-3.5"
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
        <Ionicons
          name={getPlatformIcon(device.platform)}
          size={18}
          color={colors.textSecondary}
        />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-semibold text-gray-900">
          {device.deviceName || "Unknown Device"}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-400">
          {getPlatformLabel(device.platform)} ·{" "}
          {isCurrent ? "Current device" : `Last seen ${formatLastSeen(device.lastSeenAt)}`}
        </Text>
      </View>
      {isCurrent && (
        <View className="rounded-full bg-green-100 px-2.5 py-1">
          <Text className="text-[11px] font-semibold text-green-700">
            Current
          </Text>
        </View>
      )}
      {!isCurrent && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textTertiary}
        />
      )}
    </TouchableOpacity>
  );
}

export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const { data: devices, isLoading, isError, refetch, isFetching } = useDevices();

  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [toastOpacity] = useState(() => new Animated.Value(0));
  const [toastTranslateY] = useState(() => new Animated.Value(20));

  const showToast = useCallback(
    (message: string) => {
      setToastMessage(message);
      toastOpacity.setValue(1);
      toastTranslateY.setValue(0);

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: 20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => setToastMessage(null));
      }, 2500);

      return () => clearTimeout(timer);
    },
    [toastOpacity, toastTranslateY],
  );

  const handleDevicePress = useCallback((device: DeviceInfo) => {
    setSelectedDevice(device);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedDevice(null);
  }, []);

  const handleRevoked = useCallback(() => {
    setSelectedDevice(null);
    showToast("Device revoked successfully");
  }, [showToast]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white">
          {[0, 1, 2].map((i) => (
            <View key={i}>
              <SkeletonRow />
              {i < 2 && <View className="mx-4 border-b border-gray-50" />}
            </View>
          ))}
        </View>
      );
    }

    if (isError) {
      return (
        <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white px-6 py-10">
          <View className="items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={colors.error}
              />
            </View>
            <Text className="mt-4 text-center text-[15px] font-semibold text-gray-900">
              Something went wrong
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500">
              Could not load your devices. Please try again.
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              activeOpacity={0.7}
              className="mt-5 items-center rounded-xl bg-primary px-6 py-3"
            >
              <Text className="text-sm font-semibold text-white">
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!devices || devices.length === 0) {
      return (
        <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white px-6 py-10">
          <View className="items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={colors.textTertiary}
              />
            </View>
            <Text className="mt-4 text-center text-[15px] font-semibold text-gray-900">
              No devices found
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500">
              Your connected devices will appear here.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white">
        <Text className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Devices
        </Text>
        {devices.map((device, index) => (
          <View key={device.id}>
            <DeviceRow device={device} onPress={handleDevicePress} />
            {index < devices.length - 1 && (
              <View className="mx-4 border-b border-gray-50" />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {isFetching && devices && (
        <View
          className="absolute top-0 left-0 right-0 z-10 items-center"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="rounded-full bg-black/70 px-4 py-1.5">
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        </View>
      )}

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {renderContent()}
      </Animated.ScrollView>

      <RevokeDeviceSheet
        device={selectedDevice}
        visible={!!selectedDevice}
        onClose={handleCloseSheet}
        onRevoked={handleRevoked}
      />

      {toastMessage && (
        <Animated.View
          className="absolute left-4 right-4 rounded-xl bg-black/80 px-5 py-3.5"
          style={{
            bottom: insets.bottom + 24,
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          }}
          pointerEvents="none"
        >
          <Text className="text-center text-sm font-medium text-white">
            {toastMessage}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
