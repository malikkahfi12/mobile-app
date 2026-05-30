import {
  crypto_sign_detached,
  to_base64,
  from_base64,
} from "react-native-libsodium";
import { secureStore } from "./secureStore";
import { useAuthStore } from "@/store/auth.store";
import { tokenManager } from "./tokenManager";
import { post } from "@/services/api/client";
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
  return to_base64(signature);
}

export async function loginWithDeviceChallenge(): Promise<void> {
  const username = useAuthStore.getState().username;
  const deviceId = useAuthStore.getState().deviceId;
  const privateKey = await secureStore.getPrivateKey();

  if (!username || !deviceId || !privateKey) {
    throw new Error("Device identity not initialized. Register first.");
  }

  const challenge = await requestChallenge(username, deviceId);

  const signature = signChallenge(challenge.challenge, privateKey);

  const loginResponse = await submitChallenge(
    challenge.challengeId,
    signature,
  );

  tokenManager.setAccessToken(loginResponse.accessToken);
  await tokenManager.setRefreshToken(loginResponse.refreshToken);

  const store = useAuthStore.getState();
  store.setAccessToken(loginResponse.accessToken);
  store.setUser(loginResponse.user);
}
