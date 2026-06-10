import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ModalBottomSheet } from "@swmansion/react-native-bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colors";
import type { DeviceInfo } from "@/types/auth.types";
import { useRevokeDevice } from "@/hooks/useDevices";
import { getPlatformIcon, getPlatformLabel, formatLastSeen } from "@/lib/device.helpers";

interface RevokeDeviceSheetProps {
  device: DeviceInfo | null;
  visible: boolean;
  onClose: () => void;
  onRevoked: () => void;
}

export function RevokeDeviceSheet({
  device,
  visible,
  onClose,
  onRevoked,
}: RevokeDeviceSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  const revokeMutation = useRevokeDevice();

  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevDevice, setPrevDevice] = useState(device);
  if (visible !== prevVisible || device !== prevDevice) {
    setPrevVisible(visible);
    setPrevDevice(device);
    if (visible && device) {
      setIndex(1);
    }
  }

  const handleSettle = useCallback(
    (nextIndex: number) => {
      if (nextIndex === 0 && device) {
        onClose();
      }
    },
    [device, onClose],
  );

  const handleClose = useCallback(() => {
    setIndex(0);
  }, []);

  const handleRevoke = useCallback(() => {
    if (!device) return;
    revokeMutation.mutate(device.id, {
      onSuccess: () => {
        setIndex(0);
        onRevoked();
      },
    });
  }, [device, revokeMutation, onRevoked]);

  return (
    <ModalBottomSheet
      index={index}
      onIndexChange={setIndex}
      onSettle={handleSettle}
      detents={[0, "content"]}
      scrimColor="rgba(0, 0, 0, 0.3)"
      surface={
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.white,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          ]}
        />
      }
    >
      {device ? (
        <View
          className="px-6 pt-6"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="items-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Ionicons
                name={getPlatformIcon(device.platform)}
                size={28}
                color={colors.textPrimary}
              />
            </View>
          </View>

          <Text className="mt-4 text-center text-[17px] font-semibold text-gray-900">
            {device.deviceName || t("common.unknownDevice")}
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500">
            {getPlatformLabel(device.platform)} · {formatLastSeen(device.lastSeenAt)}
          </Text>

          <View className="mt-6 rounded-xl bg-red-50 px-4 py-3.5">
            <View className="flex-row items-start">
              <Ionicons
                name="warning-outline"
                size={18}
                color={colors.error}
                style={{ marginTop: 1 }}
              />
              <Text className="ml-2.5 flex-1 text-[13px] leading-5 text-red-600">
                {t("devices.revokeWarning", { name: device.deviceName || t("devices.thisDevice") })}
              </Text>
            </View>
          </View>

          {revokeMutation.isError && (
            <Text className="mt-3 text-center text-sm text-red-500">
              {(revokeMutation.error as Error)?.message || t("common.errorGeneric")}
            </Text>
          )}

          <View className="mt-6 gap-3">
            <TouchableOpacity
              onPress={handleRevoke}
              disabled={revokeMutation.isPending}
              activeOpacity={0.7}
              className="items-center rounded-xl bg-red-500 px-4 py-3.5"
            >
              {revokeMutation.isPending ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  {t("devices.revokeDevice")}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClose}
              disabled={revokeMutation.isPending}
              activeOpacity={0.7}
              className="items-center rounded-xl border border-gray-200 px-4 py-3.5"
            >
              <Text className="text-base font-semibold text-gray-700">
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </ModalBottomSheet>
  );
}
