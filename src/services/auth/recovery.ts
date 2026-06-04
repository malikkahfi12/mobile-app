import * as Device from "expo-device";
import { changeGoogleAccount } from "@/lib/googleSignIn";
import { ensureDeviceKeypair } from "./deviceIdentity";
import { secureStore } from "./secureStore";
import { tokenManager } from "./tokenManager";
import { useAuthStore } from "@/store/auth.store";
import { signChallenge, submitChallenge } from "./login";
import { requestRecoveryToken, registerRecoveryDevice } from "./recovery.api";
import { connectGoogleAccount } from "./googleConnect.api";
import { useGoogleRecoveryStore } from "@/store/googleRecovery.store";
import type { LoginResponse } from "@/types/auth.types";

export async function recoverWithGoogle(): Promise<void> {
  const idToken = await changeGoogleAccount();

  const { recoveryToken } = await requestRecoveryToken(idToken);

  const { publicKey } = await ensureDeviceKeypair();

  const registerResult = await registerRecoveryDevice(recoveryToken, {
    publicKey,
    deviceName: Device.deviceName ?? undefined,
    platform: Device.osName === "ios" ? "ios" : "android",
  });

  const privateKey = await secureStore.getPrivateKey();
  if (!privateKey) {
    throw new Error("Device identity not initialized.");
  }

  const signature = signChallenge(registerResult.challenge, privateKey);

  const loginData = await submitChallenge(
    registerResult.challengeId,
    signature,
  );

  await storeLoginResult(loginData);

  try {
    const identity = await connectGoogleAccount(idToken);
    useGoogleRecoveryStore.getState().setGoogleEmail(identity.email);
  } catch {
    // Google account may already be linked — non-fatal
  }
}

async function storeLoginResult(data: LoginResponse): Promise<void> {
  const store = useAuthStore.getState();

  store.setAccessToken(data.accessToken);
  await tokenManager.setRefreshToken(data.refreshToken);

  store.setUser(data.user);
  store.setUsername(data.user.username);
  store.setServerDeviceId(data.device.id);
  await secureStore.saveServerDeviceId(data.device.id);

  await secureStore.saveUsername(data.user.username);
  store.setRegistered(true);
  await secureStore.markRegistered();
}
