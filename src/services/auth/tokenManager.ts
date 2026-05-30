let _accessToken: string | null = null;

export const tokenManager = {
  getAccessToken(): string | null {
    return _accessToken;
  },

  setAccessToken(token: string): void {
    _accessToken = token;
  },

  clearAccessToken(): void {
    _accessToken = null;
  },

  async getRefreshToken(): Promise<string | null> {
    const { secureStore } = await import("./secureStore");
    return secureStore.getRefreshToken();
  },

  async setRefreshToken(token: string): Promise<void> {
    const { secureStore } = await import("./secureStore");
    await secureStore.saveRefreshToken(token);
  },

  async clearAll(): Promise<void> {
    _accessToken = null;
    const { secureStore } = await import("./secureStore");
    await secureStore.deleteRefreshToken();
  },
};
