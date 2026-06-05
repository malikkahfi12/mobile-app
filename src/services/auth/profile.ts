import client, { patch } from "@/services/api/client";
import type { User } from "@/types/auth.types";

interface UpdateProfileBody {
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export async function updateProfile(body: UpdateProfileBody): Promise<User> {
  return patch<User>("/auth/me", body);
}

export async function uploadAvatar(
  uri: string,
): Promise<{ avatarUrl: string }> {
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

  const response = await client.post("/auth/me/avatar", formData);
  const body = response.data;

  if (body?.success) {
    return body.data as { avatarUrl: string };
  }

  throw new Error(body?.message || "Upload failed");
}
