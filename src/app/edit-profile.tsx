import { ActionMenu } from "@/components/ui/ActionMenu";
import { colors } from "@/constants/colors";
import { FormInput } from "@/components/ui/FormInput";
import { useAuthStore } from "@/store/auth.store";
import { useGoogleRecoveryStore } from "@/store/googleRecovery.store";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUploadAvatar } from "@/hooks/useUploadAvatar";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileSkeleton } from "@/components/ui/ProfileSkeleton";

const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/;

type ValidationError = "invalid" | "taken" | "reserved" | null;

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const googleEmail = useGoogleRecoveryStore((s) => s.googleEmail);

  const updateMutation = useUpdateProfile();
  const uploadMutation = useUploadAvatar();

  const initialName = user?.displayName || "";
  const initialUsername = user?.username || "";
  const initials = user?.avatarInitials || initialName.slice(0, 2).toUpperCase();

  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [usernameError, setUsernameError] = useState<ValidationError>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const [toastOpacity] = useState(() => new Animated.Value(0));
  const [toastTranslateY] = useState(() => new Animated.Value(20));

  const isSaving = updateMutation.isPending;
  const isUploading = uploadMutation.isPending;

  const isDirty =
    name !== initialName || username !== initialUsername || avatarUrl !== (user?.avatarUrl ?? null);

  const usernameValidation = useMemo(() => {
    if (!username) return false;
    return USERNAME_REGEX.test(username);
  }, [username]);

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

  const handlePermissionDenied = useCallback(
    (isCamera: boolean, canAskAgain: boolean) => {
      if (canAskAgain) {
        showToast(
          isCamera
            ? t("editProfile.cameraNeeded")
            : t("editProfile.photoLibraryNeeded"),
        );
      } else {
        Alert.alert(
          isCamera
            ? t("editProfile.cameraNeeded")
            : t("editProfile.photoLibraryNeeded"),
          isCamera
            ? t("editProfile.cameraPermissionDenied")
            : t("editProfile.photoPermissionDenied"),
          [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("editProfile.openSettings"),
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    },
    [showToast, t],
  );

  const handleOpenImagePicker = useCallback(
    async (useCamera: boolean) => {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      };

      try {
        if (useCamera) {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            handlePermissionDenied(true, perm.canAskAgain);
            return;
          }
        } else {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            handlePermissionDenied(false, perm.canAskAgain);
            return;
          }
        }

        const result = useCamera
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

        if (result.canceled || !result.assets?.[0]) return;

        const asset = result.assets[0];
        setAvatarUrl(asset.uri);

        uploadMutation.mutate(asset.uri, {
          onSuccess: (data) => {
            setAvatarUrl(data.avatarUrl);
            showToast(t("editProfile.avatarUpdated"));
          },
          onError: (error) => {
            setAvatarUrl(user?.avatarUrl ?? null);
            showToast(error.message || t("editProfile.uploadFailed"));
          },
        });
      } catch {
        showToast(t("editProfile.uploadFailed"));
      }
    },
    [uploadMutation, user?.avatarUrl, handlePermissionDenied, showToast, t],
  );

  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;

    const body: { username?: string; displayName?: string; avatarUrl?: string } = {};

    if (name !== initialName) body.displayName = name;
    if (username !== initialUsername) body.username = username;
    if (avatarUrl !== (user?.avatarUrl ?? null)) body.avatarUrl = avatarUrl ?? undefined;

    if (Object.keys(body).length === 0) {
      showToast(t("editProfile.noChanges"));
      return;
    }

    if (username !== initialUsername && !usernameValidation) {
      setUsernameError("invalid");
      return;
    }

    updateMutation.mutate(body, {
      onSuccess: () => {
        showToast(t("editProfile.saved"));
        setTimeout(() => router.back(), 600);
      },
      onError: (error) => {
        const msg = error.message || "";
        if (msg.includes("USERNAME_ALREADY_EXISTS")) {
          setUsernameError("taken");
        } else if (msg.includes("USERNAME_RESERVED")) {
          setUsernameError("reserved");
        } else if (msg.includes("NO_FIELDS_PROVIDED")) {
          showToast(t("editProfile.noChanges"));
        } else {
          showToast(t("editProfile.saveFailed"));
        }
      },
    });
  }, [
    isDirty,
    isSaving,
    name,
    username,
    avatarUrl,
    initialName,
    initialUsername,
    user?.avatarUrl,
    usernameValidation,
    updateMutation,
    showToast,
    t,
  ]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        t("editProfile.discardTitle"),
        t("editProfile.discardMessage"),
        [
          { text: t("editProfile.discardKeep"), style: "cancel" },
          {
            text: t("editProfile.discardConfirm"),
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  }, [isDirty, t]);

  const handleUsernameChange = useCallback((value: string) => {
    const lower = value.toLowerCase();
    setUsername(lower);
    setUsernameError(null);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      {isLoading ? (
        <ProfileSkeleton variant="edit" />
      ) : (
      <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center px-2 pt-2 pb-4">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[17px] font-semibold text-gray-900 mr-10">
            {t("editProfile.title")}
          </Text>
        </View>

        <View className="items-center pt-4 pb-8">
          <TouchableOpacity
            onPress={() => setShowPhotoMenu(true)}
            disabled={isUploading}
            activeOpacity={0.7}
            className="relative"
          >
            <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="h-24 w-24"
                  style={{ borderRadius: 48 }}
                />
              ) : (
                <Text className="text-2xl font-bold text-primary">
                  {initials}
                </Text>
              )}
              {isUploading && (
                <View className="absolute inset-0 items-center justify-center rounded-full bg-black/30">
                  <ActivityIndicator size="small" color={colors.white} />
                </View>
              )}
            </View>
            <View className="absolute -bottom-0.5 -right-0.5 h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Ionicons name="camera-outline" size={14} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        <View className="mx-4 overflow-hidden rounded-xl bg-white">
          <Text className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t("editProfile.profileInfo")}
          </Text>

          <FormInput
            label={t("editProfile.name")}
            placeholder={t("editProfile.namePlaceholder")}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
            className="mx-4 mb-2"
          />

          <View className="mx-4 mb-2">
            <FormInput
              label={t("editProfile.username")}
              placeholder={t("editProfile.usernamePlaceholder")}
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            {!usernameValidation && username.length > 0 && !usernameError && (
              <Text className="mt-1 text-xs text-red-400">
                {t("editProfile.invalidUsername")}
              </Text>
            )}
            {usernameError === "taken" && (
              <Text className="mt-1 text-xs text-red-400">
                {t("editProfile.usernameTaken")}
              </Text>
            )}
            {usernameError === "reserved" && (
              <Text className="mt-1 text-xs text-red-400">
                {t("editProfile.usernameReserved")}
              </Text>
            )}
          </View>

          <View className="mx-4 mb-4">
            {googleEmail ? (
              <>
                <FormInput
                  label={t("editProfile.email")}
                  value={googleEmail}
                  onChangeText={() => {}}
                  editable={false}
                />
                <Text className="mt-1 text-xs text-gray-400">
                  {t("editProfile.emailFootnote")}
                </Text>
              </>
            ) : (
              <View>
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t("editProfile.email")}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push("/recovery-security" as Href)
                  }
                  activeOpacity={0.7}
                  className="flex-row items-center rounded-xl bg-gray-100 px-4 py-3"
                >
                  <View className="flex-1">
                    <Text className="text-base text-gray-900">
                      {t("editProfile.emailNotLinked")}
                    </Text>
                    <Text className="mt-0.5 text-xs text-gray-400">
                      {t("editProfile.emailNotLinkedDesc")}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View className="mx-4 mt-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isDirty || isSaving}
            activeOpacity={0.7}
            className={`h-12 items-center justify-center rounded-xl ${
              !isDirty || isSaving ? "bg-primary/50" : "bg-primary"
            }`}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text className="text-base font-semibold text-white">
                {t("editProfile.save")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {toastMessage && (
          <Animated.View
            className="absolute left-4 right-4 rounded-xl bg-black/80 px-5 py-3.5"
            style={{
              bottom: 40,
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
      </KeyboardAvoidingView>

      <ActionMenu
        visible={showPhotoMenu}
        title={t("editProfile.changePhoto")}
        options={[
          {
            label: t("editProfile.takePhoto"),
            icon: "camera-outline",
            onPress: () => handleOpenImagePicker(true),
          },
          {
            label: t("editProfile.pickFromLibrary"),
            icon: "image-outline",
            onPress: () => handleOpenImagePicker(false),
          },
        ]}
        cancelLabel={t("common.cancel")}
        onCancel={() => setShowPhotoMenu(false)}
      />
      </>
      )}
    </SafeAreaView>
  );
}
