# Frontend Error Handling Guide

The backend guarantees **every response** follows one of two shapes:

## Response Envelope

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "STRING_CODE",
    "message": "Human-readable description"
  }
}
```

The `success` field is a reliable discriminator. Do **not** rely on HTTP status codes alone — use `success` first.

---

## Error Codes

### Global (all endpoints)

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Missing, expired, or invalid JWT (global guard rejection) |
| `INVALID_ACCESS_TOKEN` | 401 | Token verification failed (auth-specific guard) |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `VALIDATION_ERROR` | 400 | Request body/query/param validation failed |
| `NOT_FOUND` | 404 | Resource does not exist |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `CONFLICT` | 409 | Resource conflict (e.g. duplicate) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `ERROR` | any | Fallback for unmapped status codes |

### Auth Module

| Code | HTTP | Meaning |
|------|------|---------|
| `USER_INACTIVE` | 401 | User account has been deactivated |
| `USERNAME_RESERVED` | 400 | The requested username is reserved |
| `USERNAME_ALREADY_EXISTS` | 400 | Username is already taken |
| `NO_FIELDS_PROVIDED` | 400 | Update profile request had no fields |
| `INVALID_USERNAME` | 400 | Username failed validation rules |
| `INVALID_PUBLIC_KEY` | 400 | Device public key is malformed |
| `INVALID_SIGNATURE` | 400 | Device signature verification failed |
| `INVALID_CHALLENGE` | 400 | Auth challenge ID is invalid or missing |
| `CHALLENGE_EXPIRED` | 400 | Auth challenge has expired |
| `CHALLENGE_ALREADY_CONSUMED` | 400 | Auth challenge was already used |
| `INVALID_REFRESH_TOKEN` | 400 | Refresh token is invalid or expired |
| `REFRESH_TOKEN_EXPIRED` | 400 | Refresh token has expired |
| `DEVICE_NOT_FOUND` | 400 | Device is not registered |
| `CANNOT_REMOVE_CURRENT_DEVICE` | 400 | Tried to remove the currently active device |
| `INVALID_RECOVERY_TOKEN` | 400 | Account recovery token is invalid or expired |
| `INVALID_GOOGLE_TOKEN` | 400 | Google ID token could not be verified |
| `GOOGLE_EMAIL_NOT_VERIFIED` | 400 | Google account email is not verified |
| `GOOGLE_ACCOUNT_ALREADY_LINKED` | 400 | Google account is already linked to another user |
| `GOOGLE_ACCOUNT_NOT_LINKED` | 400 | No Google account is linked to this user |

### File Upload

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_FILE` | 400 | File missing, too large (>5 MB), or unsupported type (JPEG, PNG, WebP, GIF only) |

---

## Recommended Client Architecture

### 1. Response interceptor (unwrap + error detect)

```ts
// Example with Axios
api.interceptors.response.use(
  (response) => {
    const body = response.data;

    if (body.success === false) {
      const { code, message } = body.error;
      throw new ApiError(code, message, response.status);
    }

    // Unwrap the envelope — return only { data, meta }
    return {
      data: body.data,
      meta: body.meta ?? {},
    };
  },
  (error) => {
    // True network errors: DNS failure, connection refused, timeout, CORS
    // These have no response at all.
    if (!error.response) {
      throw new NetworkError('Network error. Please check your connection.');
    }

    // The backend may send errors through the GlobalExceptionFilter,
    // which still uses the unified envelope. Parse it the same way.
    const body = error.response.data;
    if (body?.success === false) {
      const { code, message } = body.error;
      throw new ApiError(code, message, error.response.status);
    }

    // Unexpected response shape — treat as network error
    throw new NetworkError('Unexpected server response');
  },
);
```

### 2. Error class hierarchy

```ts
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}
```

### 3. Handling errors at the call site

```ts
try {
  const { data } = await api.uploadAvatar(file);
  // data.avatarUrl
} catch (err) {
  if (err instanceof NetworkError) {
    // No internet, server down, CORS block
    // → show "Connection lost" banner
    return;
  }

  if (err instanceof ApiError) {
    switch (err.code) {
      case 'UNAUTHORIZED':
      case 'INVALID_ACCESS_TOKEN':
        // → redirect to login, clear stored tokens
        break;
      case 'TOO_MANY_REQUESTS':
        // → show "Slow down" toast, retry after delay
        break;
      case 'USER_INACTIVE':
        // → show "Account deactivated" screen
        break;
      case 'INVALID_FILE':
        // → show "File too large or unsupported type" toast
        break;
      case 'INTERNAL_ERROR':
        // → show "Something went wrong" toast + report
        break;
      default:
        // → show err.message as toast for unknown codes
        break;
    }
    return;
  }

  // Fallback for unexpected non-ApiError exceptions
}
```

### 4. Request interceptor (attach auth)

```ts
api.interceptors.request.use((config) => {
  const token = getAccessToken(); // from secure storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Key Principles

1. **The `success` field always discriminates.** If `success` is `true`, read `data`. If `false`, read `error.code` and `error.message`. There are no other shapes from any backend endpoint.

2. **NetworkError is only for actual network failures.** If the server returns an HTTP response (any status), the interceptor should parse the body and throw `ApiError`. Only throw `NetworkError` when there is no response at all (Axios `error.response` is `undefined`).

3. **Error codes are stable and machine-readable.** Route on `code`, not on `message` strings. Messages are for display only.

4. **Token refresh on 401.** When intercepting `UNAUTHORIZED` or `INVALID_ACCESS_TOKEN`, attempt a silent token refresh before redirecting to login. Avoid refreshing on the refresh endpoint itself to prevent loops.
