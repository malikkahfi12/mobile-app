import axios from "axios";
import { apiConfig } from "./config";
import {
  ApiError,
  NetworkError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "./errors";

// eslint-disable-next-line import/no-named-as-default-member
const client = axios.create({
  baseURL: apiConfig.apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiConfig.apiKey,
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
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
export default client;
