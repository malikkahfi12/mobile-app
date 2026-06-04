import { useCallback, useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["42%"], []);

  const revokeMutation = useRevokeDevice();

  useEffect(() => {
    if (visible && device) {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [visible, device]);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const handleRevoke = useCallback(() => {
    if (!device) return;
    revokeMutation.mutate(device.id, {
      onSuccess: () => {
        onRevoked();
      },
    });
  }, [device, revokeMutation, onRevoked]);

  if (!device) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      onClose={onClose}
      onChange={handleSheetChange}
      handleIndicatorStyle={{
        backgroundColor: colors.textTertiary,
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: colors.white }}
    >
      <View className="flex-1 px-6" style={{ paddingBottom: insets.bottom + 24 }}>
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
            {(revokeMutation.error as Error)?.message ||
              t("common.errorGeneric")}
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
    </BottomSheet>
  );
}
