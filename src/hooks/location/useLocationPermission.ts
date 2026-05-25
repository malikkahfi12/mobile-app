import { useState, useEffect, useCallback } from "react";
import {
  requestForegroundPermission,
  getPermissionStatus,
} from "@/services/location/location.permissions";
import { useLocationStore } from "@/store/location.store";
import type { PermissionStatus } from "@/services/location/location.types";

export function useLocationPermission() {
  const [status, setStatus] = useState<PermissionStatus>("undetermined");
  const setPermission = useLocationStore((s) => s.setPermission);

  useEffect(() => {
    getPermissionStatus().then((s) => {
      setStatus(s);
      setPermission(s === "granted");
    });
  }, [setPermission]);

  const request = useCallback(async () => {
    const s = await requestForegroundPermission();
    setStatus(s);
    setPermission(s === "granted");
    return s;
  }, [setPermission]);

  return { status, isGranted: status === "granted", request };
}
