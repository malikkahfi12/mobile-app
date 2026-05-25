import { useEffect, useRef } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { useAppStore } from "@/store/app.store";

export function useNetworkStatus() {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    NetInfo.fetch().then((state: NetInfoState) => {
      useAppStore.getState().setOnlineStatus(
        state.isConnected ?? true,
        state.isInternetReachable,
      );
    });

    unsubscribeRef.current = NetInfo.addEventListener((state: NetInfoState) => {
      useAppStore.getState().setOnlineStatus(
        state.isConnected ?? true,
        state.isInternetReachable,
      );
    });

    return () => {
      unsubscribeRef.current?.();
    };
  }, []);
}
