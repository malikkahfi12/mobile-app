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
    useAuthStore.getState().setRegistered(true);
    return;
  }

  const username = `u${deviceId.replace(/-/g, "").slice(0, 12)}`;

  try {
    const response = await registerDevice({
      username,
      displayName: "Rider",
      publicKey,
      deviceName: Device.deviceName ?? undefined,
      platform: Device.osName === "ios" ? "ios" : "android",
    });

    tokenManager.setAccessToken(response.accessToken);
    await tokenManager.setRefreshToken(response.refreshToken);

    const store = useAuthStore.getState();
    store.setAccessToken(response.accessToken);
    store.setUser(response.user);
    store.setUsername(username);
    store.setRegistered(true);

    await secureStore.markRegistered();
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 409) {
      useAuthStore.getState().setRegistered(true);
      await secureStore.markRegistered();
      return;
    }
    throw error;
  }
}
