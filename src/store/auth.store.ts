import { create } from "zustand";
import type { User } from "@/types/auth.types";
import { tokenManager } from "@/services/auth/tokenManager";
import { secureStore } from "@/services/auth/secureStore";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  username: string | null;
  deviceId: string | null;
  serverDeviceId: string | null;
  publicKey: string | null;
  isAuthenticated: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;

  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setUsername: (username: string | null) => void;
  setDeviceId: (id: string | null) => void;
  setServerDeviceId: (id: string | null) => void;
  setPublicKey: (key: string | null) => void;
  setRegistered: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => Promise<void>;
  restoreDeviceId: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  username: null,
  deviceId: null,
  serverDeviceId: null,
  publicKey: null,
  isAuthenticated: false,
  isRegistered: false,
  isLoading: false,
  error: null,

  setAccessToken: (token) => {
    if (token) {
      tokenManager.setAccessToken(token);
    } else {
      tokenManager.clearAccessToken();
    }
    set({ accessToken: token, isAuthenticated: !!token, error: null });
  },

  setUser: (user) => set({ user }),

  setUsername: (username) => set({ username }),

  setDeviceId: (id) => {
    set({ deviceId: id });
    if (id) {
      secureStore.saveDeviceId(id);
    }
  },

  setServerDeviceId: (id) => {
    set({ serverDeviceId: id });
    if (id) {
      secureStore.saveServerDeviceId(id);
    }
  },

  setPublicKey: (key) => set({ publicKey: key }),

  setRegistered: (value) => set({ isRegistered: value }),

  setLoading: (value) => set({ isLoading: value }),

  setError: (error) => set({ error }),

  clearAuth: async () => {
    await tokenManager.clearAll();
    set({
      accessToken: null,
      user: null,
      username: null,
      serverDeviceId: null,
      isAuthenticated: false,
      isRegistered: false,
      error: null,
    });
  },

  restoreDeviceId: async () => {
    const id = await secureStore.getDeviceId();
    if (id) {
      set({ deviceId: id });
    }
  },
}));
