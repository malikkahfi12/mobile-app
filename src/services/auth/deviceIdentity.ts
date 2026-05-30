import {
  crypto_sign_keypair,
  to_base64,
  randombytes_buf,
} from "react-native-libsodium";
import { secureStore } from "./secureStore";
import { useAuthStore } from "@/store/auth.store";
import type { DeviceIdentity } from "@/types/auth.types";

function generateDeviceId(): string {
  const bytes = randombytes_buf(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateKeypair(): { publicKey: string; privateKey: string } {
  const keypair = crypto_sign_keypair();
  return {
    publicKey: to_base64(keypair.publicKey),
    privateKey: to_base64(keypair.privateKey),
  };
}

export async function ensureDeviceKeypair(): Promise<DeviceIdentity> {
  const [existingDeviceId, existingPublicKey, existingPrivateKey] =
    await Promise.all([
      secureStore.getDeviceId(),
      secureStore.getPublicKey(),
      secureStore.getPrivateKey(),
    ]);

  let deviceId = existingDeviceId;
  let publicKey = existingPublicKey;
  let privateKey = existingPrivateKey;

  if (!deviceId) {
    deviceId = generateDeviceId();
    await secureStore.saveDeviceId(deviceId);
  }

  const needsKeys = !privateKey || !publicKey;
  if (needsKeys) {
    const kp = generateKeypair();
    privateKey = kp.privateKey;
    publicKey = kp.publicKey;
    await Promise.all([
      secureStore.savePrivateKey(privateKey),
      secureStore.savePublicKey(publicKey),
    ]);
  }

  useAuthStore.getState().setDeviceId(deviceId);
  useAuthStore.getState().setPublicKey(publicKey!);

  return { deviceId: deviceId!, publicKey: publicKey! };
}
