import { useState, useEffect, useCallback } from "react";
import {
  requestPermissions,
  getPermissionStatus,
} from "@/services/notifications";
import type { NotificationPermissionStatus } from "@/services/notifications";

export function useNotificationPermission() {
  const [status, setStatus] =
    useState<NotificationPermissionStatus>("undetermined");

  useEffect(() => {
    getPermissionStatus().then(setStatus);
  }, []);

  const request = useCallback(async () => {
    const s = await requestPermissions();
    setStatus(s);
    return s;
  }, []);

  return { status, isGranted: status === "granted", request };
}
