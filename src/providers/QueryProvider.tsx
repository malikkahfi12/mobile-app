import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppStore } from "@/store/app.store";
import type { Persister, PersistedClient } from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";

const CACHE_KEY = "PATHEO_QUERY_CACHE";
const MAX_AGE = 24 * 60 * 60 * 1000;
const BUSTER = "v1";

const asyncPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(client));
    } catch {
      // ignore persistence errors
    }
  },
  restoreClient: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as PersistedClient) : undefined;
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
  },
};

onlineManager.setEventListener((setOnline) => {
  let previousOnline = useAppStore.getState().isOnline;

  const unsubscribe = useAppStore.subscribe((state) => {
    if (state.isOnline === previousOnline) return;
    previousOnline = state.isOnline;
    setOnline(state.isOnline !== false);
  });

  return unsubscribe;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export { queryClient };

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncPersister,
        maxAge: MAX_AGE,
        buster: BUSTER,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
