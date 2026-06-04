export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export class NetworkError extends Error {
  constructor(message = "Network error. Please check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = "Authentication required") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}
