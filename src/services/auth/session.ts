import { secureStore } from "./secureStore";
import { useAuthStore } from "@/store/auth.store";
import { tokenManager } from "./tokenManager";
import { get, post } from "@/services/api/client";
import type { RefreshResponse, User } from "@/types/auth.types";

export async function restoreSession(): Promise<void> {
  const refreshToken = await secureStore.getRefreshToken();
  if (!refreshToken) return;

  try {
    const tokens = await post<RefreshResponse>("/auth/refresh", {
      refreshToken,
    });

    tokenManager.setAccessToken(tokens.accessToken);
    await tokenManager.setRefreshToken(tokens.refreshToken);

    const user = await get<User>("/auth/me");

    const store = useAuthStore.getState();
    store.setAccessToken(tokens.accessToken);
    store.setUser(user);
  } catch {
    if (!tokenManager.getAccessToken()) {
      await useAuthStore.getState().clearAuth();
    }
  }
}
