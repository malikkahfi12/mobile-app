import i18n from "@/lib/i18n";

export function getPlatformIcon(platform?: string) {
  const p = (platform ?? "").toLowerCase();
  if (p.includes("android")) return "phone-portrait-outline";
  if (p.includes("ios") || p.includes("iphone") || p.includes("ipad"))
    return "phone-portrait-outline";
  if (p.includes("web") || p.includes("browser")) return "desktop-outline";
  return "hardware-chip-outline";
}

export function getPlatformLabel(platform?: string) {
  if (!platform) return i18n.t("time.unknown");
  const p = platform.toLowerCase();
  if (p.includes("ios") || p.includes("iphone")) return "iOS";
  if (p.includes("ipad") || p.includes("ipados")) return "iPadOS";
  if (p.includes("android")) return "Android";
  if (p.includes("web") || p.includes("browser")) return "Web";
  return platform;
}

export function formatLastSeen(lastSeenAt?: string) {
  if (!lastSeenAt) return i18n.t("time.unknown");

  const now = Date.now();
  const lastSeen = new Date(lastSeenAt).getTime();
  const diffMs = now - lastSeen;

  if (diffMs < 0) return i18n.t("time.justNow");

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return i18n.t("time.justNow");
  if (minutes === 1) return i18n.t("time.minuteAgo");
  if (minutes < 60) return i18n.t("time.minutesAgo", { count: minutes });
  if (hours === 1) return i18n.t("time.hourAgo");
  if (hours < 24) return i18n.t("time.hoursAgo", { count: hours });
  if (days === 1) return i18n.t("time.yesterday");
  if (days < 7) return i18n.t("time.daysAgo", { count: days });

  const date = new Date(lastSeenAt);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
