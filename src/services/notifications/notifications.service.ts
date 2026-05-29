import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { NotificationPermissionStatus } from "./notifications.types";
import {
  CATEGORY_TRIP,
  ACTION_END_TRIP,
  ACTION_NEXT_STEP,
} from "./notifications.types";

const CHANNEL_ID = "trip-channel";

let isSetup = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function createChannelAndroid(): void {
  if (Platform.OS !== "android") return;
  Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Active Trip",
    description: "Notifications for active trip guidance",
    importance: Notifications.AndroidImportance.LOW,
    bypassDnd: false,
    enableVibrate: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: false,
    sound: null,
  });
}

export function setupNotifications(): void {
  if (isSetup) return;
  createChannelAndroid();
  isSetup = true;
}

export async function registerTripCategory(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(CATEGORY_TRIP, [
    {
      identifier: ACTION_END_TRIP,
      buttonTitle: "End Trip",
      options: {
        opensAppToForeground: true,
        isDestructive: true,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: ACTION_NEXT_STEP,
      buttonTitle: "Next",
      options: {
        opensAppToForeground: true,
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);
}

export type TripAction = typeof ACTION_END_TRIP | typeof ACTION_NEXT_STEP;

export function onTripAction(
  callback: (action: TripAction) => void,
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const actionId = response.actionIdentifier;
    if (
      actionId === ACTION_END_TRIP ||
      actionId === ACTION_NEXT_STEP
    ) {
      callback(actionId);
    }
  });
}

export async function requestPermissions(): Promise<NotificationPermissionStatus> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === "granted" && Platform.OS === "android") {
    createChannelAndroid();
  }
  return status;
}

export async function getPermissionStatus(): Promise<NotificationPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export function getChannelId(): string {
  return CHANNEL_ID;
}
