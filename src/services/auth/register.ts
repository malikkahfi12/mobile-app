import * as Device from "expo-device";
import { ensureDeviceKeypair } from "./deviceIdentity";
import { secureStore } from "./secureStore";
import { useAuthStore } from "@/store/auth.store";
import { tokenManager } from "./tokenManager";
import { post } from "@/services/api/client";
import { ApiError } from "@/services/api/errors";
import type { RegisterParams, RegisterResponse } from "@/types/auth.types";

async function registerDevice(
  params: RegisterParams,
): Promise<RegisterResponse> {
  return post<RegisterResponse>("/auth/register", params);
}

export async function ensureDeviceRegistered(): Promise<void> {
  const { deviceId, publicKey } = await ensureDeviceKeypair();

  if (await secureStore.isRegistered()) {
    const store = useAuthStore.getState();
    store.setRegistered(true);

    const savedUsername = await secureStore.getUsername();
    if (savedUsername) store.setUsername(savedUsername);

    const savedServerDeviceId = await secureStore.getServerDeviceId();
    if (savedServerDeviceId) store.setServerDeviceId(savedServerDeviceId);

    return;
  }

  const username = `u${deviceId.replace(/-/g, "").slice(0, 12)}`;
  console.log(
    "[DEBUG] register: username=", username,
    "deviceId=", deviceId,
  );

  await secureStore.saveUsername(username);

  try {
    console.log("[DEBUG] register: POST /auth/register start");
    const response = await registerDevice({
      username,
      displayName: "Rider",
      publicKey,
      deviceName: Device.deviceName ?? undefined,
      platform: Device.osName === "ios" ? "ios" : "android",
    });

    tokenManager.setAccessToken(response.accessToken);
    await tokenManager.setRefreshToken(response.refreshToken);

    console.log("[DEBUG] register: SUCCESS user=", response.user.username, "serverDeviceId=", response.device?.id);

    const store = useAuthStore.getState();
    store.setAccessToken(response.accessToken);
    store.setUser(response.user);
    store.setUsername(username);
    store.setServerDeviceId(response.device.id);
    store.setRegistered(true);

    await secureStore.markRegistered();
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 409) {
      console.log("[DEBUG] register: 409 → restoring username from SecureStore");
      const savedUsername = await secureStore.getUsername();
      if (savedUsername) {
        useAuthStore.getState().setUsername(savedUsername);
      }
      useAuthStore.getState().setRegistered(true);
      await secureStore.markRegistered();
      return;
    }
    console.log(
      "[DEBUG] register: ERROR",
      error instanceof Error ? error.message : String(error),
      "statusCode=",
      error instanceof ApiError ? error.statusCode : "N/A",
    );
    throw error;
  }
}
