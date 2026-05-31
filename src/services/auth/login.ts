import {
  crypto_sign_detached,
  to_base64,
  from_base64,
  base64_variants,
} from "react-native-libsodium";
import { secureStore } from "./secureStore";
import { useAuthStore } from "@/store/auth.store";
import { tokenManager } from "./tokenManager";
import { post } from "@/services/api/client";
import client from "@/services/api/client";
import type {
  ChallengeResponse,
  LoginResponse,
} from "@/types/auth.types";

async function requestChallenge(
  username: string,
  deviceId: string,
): Promise<ChallengeResponse> {
  return post<ChallengeResponse>("/auth/challenge", { username, deviceId });
}

async function submitChallenge(
  challengeId: string,
  signature: string,
): Promise<LoginResponse> {
  return post<LoginResponse>("/auth/login", { challengeId, signature });
}

function signChallenge(
  challengeBase64: string,
  privateKeyBase64: string,
): string {
  const challengeBytes = from_base64(challengeBase64);
  const privateKeyBytes = from_base64(privateKeyBase64);
  const signature = crypto_sign_detached(challengeBytes, privateKeyBytes);
  return to_base64(signature, base64_variants.URLSAFE_NO_PADDING);
}

export async function loginWithDeviceChallenge(): Promise<void> {
  let username = useAuthStore.getState().username;
  if (!username) {
    username = await secureStore.getUsername();
    if (username) {
      useAuthStore.getState().setUsername(username);
    }
  }

  let deviceId = useAuthStore.getState().serverDeviceId;
  if (!deviceId) {
    deviceId = await secureStore.getServerDeviceId();
    if (deviceId) {
      useAuthStore.getState().setServerDeviceId(deviceId);
    }
  }
  if (!deviceId) {
    deviceId = useAuthStore.getState().deviceId;
  }

  const privateKey = await secureStore.getPrivateKey();

  if (!username || !deviceId || !privateKey) {
    throw new Error("Device identity not initialized. Register first.");
  }

  const challenge = await requestChallenge(username, deviceId);

  const signature = signChallenge(challenge.challenge, privateKey);

  let loginBody;
  try {
    const loginResponse = await client.post("/auth/login", {
      challengeId: challenge.challengeId,
      signature,
    });
    loginBody = loginResponse.data;
  } catch (err: unknown) {
    throw err;
  }

  if (!loginBody?.success) {
    throw new Error(
      `Login failed: ${loginBody?.message || JSON.stringify(loginBody) || "Request failed"}`,
    );
  }

  const loginData = loginBody.data as LoginResponse;

  tokenManager.setAccessToken(loginData.accessToken);
  await tokenManager.setRefreshToken(loginData.refreshToken);

  const store = useAuthStore.getState();
  store.setAccessToken(loginData.accessToken);
  store.setUser(loginData.user);
  if (loginData.device?.id) {
    store.setServerDeviceId(loginData.device.id);
    await secureStore.saveServerDeviceId(loginData.device.id);
  }
}
