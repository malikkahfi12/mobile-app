import axios from "axios";
import { apiConfig } from "./config";
import {
  ApiError,
  NetworkError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "./errors";
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

// eslint-disable-next-line import/no-named-as-default-member
const client = axios.create({
  baseURL: apiConfig.apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiConfig.apiKey,
  },
});

client.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url as string | undefined;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !url?.startsWith("/auth/")
    ) {
      originalRequest._retry = true;

      const newToken = await getOrCreateRefresh();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      }
    }

    if (error.response) {
      const { data } = error.response;
      const message = data?.message || "Request failed";

      switch (status) {
        case 400:
          throw new ValidationError(message);
        case 401:
          throw new AuthenticationError(message);
        case 404:
          throw new NotFoundError(message);
        default:
          throw new ApiError(message, status);
      }
    }

    if (error.request) {
      throw new NetworkError();
    }

    throw error;
  },
);

async function get<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await client.get(path, { params });
  const body = response.data;

  if (body?.success) {
    return body.data as T;
  }

  throw new ApiError(body?.message || "Request failed", response.status);
}

async function post<T>(path: string, data?: unknown): Promise<T> {
  const response = await client.post(path, data);
  const body = response.data;

  if (body?.success) {
    return body.data as T;
  }

  throw new ApiError(body?.message || "Request failed", response.status);
}

export { get, post };

export function setAuthToken(token: string): void {
  tokenManager.setAccessToken(token);
}

export function clearAuthToken(): void {
  tokenManager.clearAccessToken();
}

export default client;
