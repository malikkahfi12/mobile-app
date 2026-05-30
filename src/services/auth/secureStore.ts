import * as SecureStore from "expo-secure-store";

const KEYS = {
  refreshToken: "auth-refresh-token",
  privateKey: "auth-private-key",
  publicKey: "auth-public-key",
  deviceId: "auth-device-id",
  registered: "auth-registered",
  onboardingCompleted: "onboarding-completed",
} as const;

export const secureStore = {
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.refreshToken);
  },

  async saveRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.refreshToken, token);
  },

  async deleteRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.refreshToken);
  },

  async getPrivateKey(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.privateKey);
  },

  async savePrivateKey(key: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.privateKey, key);
  },

  async deletePrivateKey(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.privateKey);
  },

  async getPublicKey(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.publicKey);
  },

  async savePublicKey(key: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.publicKey, key);
  },

  async deletePublicKey(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.publicKey);
  },

  async getDeviceId(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.deviceId);
  },

  async saveDeviceId(id: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.deviceId, id);
  },

  async deleteDeviceId(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.deviceId);
  },

  async isRegistered(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(KEYS.registered);
    return value === "true";
  },

  async markRegistered(): Promise<void> {
    await SecureStore.setItemAsync(KEYS.registered, "true");
  },

  async getOnboardingCompleted(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(KEYS.onboardingCompleted);
    return value === "true";
  },

  async setOnboardingCompleted(): Promise<void> {
    await SecureStore.setItemAsync(KEYS.onboardingCompleted, "true");
  },

  async clearOnboardingCompleted(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.onboardingCompleted);
  },
};
