import { post } from "@/services/api/client";
import { useAuthStore } from "@/store/auth.store";
import { secureStore } from "./secureStore";

export async function logoutUser(): Promise<void> {
  try {
    const refreshToken = await secureStore.getRefreshToken();
    if (refreshToken) {
      await post("/auth/logout", { refreshToken });
    }
  } catch {
  } finally {
    await secureStore.clearOnboardingCompleted();
    await useAuthStore.getState().clearAuth();
  }
}
