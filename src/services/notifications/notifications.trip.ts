import * as Notifications from "expo-notifications";
import { getChannelId } from "./notifications.service";
import {
  TRIP_NOTIFICATION_ID,
  CATEGORY_TRIP,
} from "./notifications.types";

let isActive = false;

export async function notifyTripStarted(
  destinationName: string,
  instruction: string,
  subtitle: string,
): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  isActive = true;

  await cancelTripNotification();

  const body = [subtitle, "Trip in progress"].filter(Boolean).join(" · ");

  await Notifications.scheduleNotificationAsync({
    identifier: TRIP_NOTIFICATION_ID,
    content: {
      title: destinationName,
      subtitle: instruction,
      body,
      categoryIdentifier: CATEGORY_TRIP,
      data: {
        destinationName,
        type: "trip-active",
      },
      ...(getChannelId() ? { channelId: getChannelId() } : {}),
    },
    trigger: null,
  });
}

export async function updateTripNotification(
  destinationName: string,
  instruction: string,
  subtitle: string,
): Promise<void> {
  if (!isActive) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  await cancelTripNotification();

  const body = [subtitle, "Trip in progress"].filter(Boolean).join(" · ");

  await Notifications.scheduleNotificationAsync({
    identifier: TRIP_NOTIFICATION_ID,
    content: {
      title: destinationName,
      subtitle: instruction,
      body,
      categoryIdentifier: CATEGORY_TRIP,
      data: {
        destinationName,
        type: "trip-active",
      },
      ...(getChannelId() ? { channelId: getChannelId() } : {}),
    },
    trigger: null,
  });
}

export async function notifyTripEnded(): Promise<void> {
  isActive = false;
  await cancelTripNotification();
}

async function cancelTripNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(TRIP_NOTIFICATION_ID);
  await Notifications.dismissAllNotificationsAsync();
}

export async function notifyUpcomingTransfer(): Promise<void> {
  // placeholder for future transfer alerts
}

export async function notifyNearDestination(): Promise<void> {
  // placeholder for future destination alerts
}
