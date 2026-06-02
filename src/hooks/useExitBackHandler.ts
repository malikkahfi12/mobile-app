import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Platform } from "react-native";

const EXIT_TIMEOUT_MS = 2000;
const TOAST_MESSAGE = "Press again to exit";

export function useExitBackHandler(enabled = true) {
  const lastPressRef = useRef<number>(0);
  const [toastVisible, setToastVisible] = useState(false);

  const handleBackPress = useCallback(() => {
    if (!enabled || Platform.OS !== "android") return false;

    const now = Date.now();

    if (now - lastPressRef.current < EXIT_TIMEOUT_MS) {
      setToastVisible(false);
      lastPressRef.current = 0;
      return false;
    }

    lastPressRef.current = now;
    setToastVisible(true);
    return true;
  }, [enabled]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => sub.remove();
  }, [handleBackPress]);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return { toastVisible, toastMessage: TOAST_MESSAGE, dismissToast };
}
