import { patch } from "@/services/api/client";
import { apiConfig } from "@/services/api/config";
import { tokenManager } from "@/services/auth/tokenManager";
import type { User } from "@/types/auth.types";

interface UpdateProfileBody {
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export async function updateProfile(body: UpdateProfileBody): Promise<User> {
  return patch<User>("/auth/me", body);
}

export function uploadAvatar(uri: string): Promise<{ avatarUrl: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const filename = uri.split("/").pop() || "avatar.jpg";

    const extension = filename.split(".").pop()?.toLowerCase();
    const mimeType =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : extension === "gif"
            ? "image/gif"
            : "image/jpeg";

    formData.append("file", {
      uri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiConfig.apiUrl}/auth/me/avatar`);
    xhr.setRequestHeader("x-api-key", apiConfig.apiKey);
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${tokenManager.getAccessToken()}`,
    );
    xhr.timeout = 30000;

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (body?.success) {
          resolve(body.data as { avatarUrl: string });
        } else {
          reject(
            new Error(body?.error?.message || body?.message || "Upload failed"),
          );
        }
      } catch {
        reject(new Error("Upload failed"));
      }
    };

    xhr.ontimeout = () => reject(new Error("Upload timed out"));
    xhr.onerror = () =>
      reject(new Error("Network error. Please check your connection."));

    xhr.send(formData);
  });
}
