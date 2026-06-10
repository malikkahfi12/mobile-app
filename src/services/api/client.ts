import axios from "axios";
import { apiConfig } from "./config";
import { ApiError, NetworkError } from "./errors";
import { tokenManager } from "@/services/auth/tokenManager";
import { secureStore } from "@/services/auth/secureStore";
import { useAuthStore } from "@/store/auth.store";

let _refreshPromise: Promise<string | null> | null = null;

function getOrCreateRefresh(): Promise<string | null> {
  if (!_refreshPromise) {
    _refreshPromise = refreshAccessToken().finally(() => {
      _refreshPromise = null;
    });
  }
  return _refreshPromise;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await secureStore.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${apiConfig.apiUrl}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiConfig.apiKey,
        },
      },
    );

    const body = response.data;
    if (!body?.success) return null;

    const tokens = body.data as { accessToken: string; refreshToken: string };
    tokenManager.setAccessToken(tokens.accessToken);
    await secureStore.saveRefreshToken(tokens.refreshToken);
    useAuthStore.getState().setAccessToken(tokens.accessToken);

    return tokens.accessToken;
  } catch {
    await useAuthStore.getState().clearAuth();
    return null;
  }
}

const PUBLIC_PREFIXES = [
  "/auth/register",
  "/auth/challenge",
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/auth/recovery/",
  "/health",
];

function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_PREFIXES.some((p) => url.startsWith(p));
}

// eslint-disable-next-line import/no-named-as-default-member
const client = axios.create({
  baseURL: apiConfig.apiUrl,
  timeout: 15000,
  headers: {
    "x-api-key": apiConfig.apiKey,
  },
});

client.interceptors.request.use((config) => {
  if (!isPublicEndpoint(config.url)) {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    const body = response.data;

    if (body?.success === false) {
      throw new ApiError(
        body.error.code,
        body.error.message,
        response.status,
      );
    }

    if (body?.success) {
      response.data = body.data;
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url as string | undefined;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicEndpoint(url)
    ) {
      originalRequest._retry = true;

      const newToken = await getOrCreateRefresh();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      }
    }

    if (error.response) {
      const body = error.response.data;

      if (body?.success === false) {
        throw new ApiError(
          body.error.code,
          body.error.message,
          error.response.status,
        );
      }

      throw new ApiError("ERROR", "Request failed", error.response.status);
    }

    if (error.request) {
      console.error("[CLIENT] NetworkError on:", error.config?.baseURL, error.config?.url);
      throw new NetworkError();
    }

    throw error;
  },
);

async function get<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const { data } = await client.get(path, { params });
  return data as T;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await client.post(path, body);
  return data as T;
}

async function del<T>(path: string): Promise<T> {
  const { data } = await client.delete(path);
  return data as T;
}

async function patch<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await client.patch(path, body);
  return data as T;
}

export { get, post, patch, del };

export function setAuthToken(token: string): void {
  tokenManager.setAccessToken(token);
}

export function clearAuthToken(): void {
  tokenManager.clearAccessToken();
}

export default client;
