export function getPlatformIcon(platform?: string) {
  const p = (platform ?? "").toLowerCase();
  if (p.includes("android")) return "phone-portrait-outline";
  if (p.includes("ios") || p.includes("iphone") || p.includes("ipad"))
    return "phone-portrait-outline";
  if (p.includes("web") || p.includes("browser")) return "desktop-outline";
  return "hardware-chip-outline";
}

export function getPlatformLabel(platform?: string) {
  if (!platform) return "Unknown";
  const p = platform.toLowerCase();
  if (p.includes("ios") || p.includes("iphone")) return "iOS";
  if (p.includes("ipad") || p.includes("ipados")) return "iPadOS";
  if (p.includes("android")) return "Android";
  if (p.includes("web") || p.includes("browser")) return "Web";
  return platform;
}

export function formatLastSeen(lastSeenAt?: string) {
  if (!lastSeenAt) return "Unknown";

  const now = Date.now();
  const lastSeen = new Date(lastSeenAt).getTime();
  const diffMs = now - lastSeen;

  if (diffMs < 0) return "Just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  const date = new Date(lastSeenAt);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
