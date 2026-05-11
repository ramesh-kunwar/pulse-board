class ApiError extends Error {
  statusCode: number;
  errors?: object[];
  isOperational: boolean;

  constructor(statusCode: number, message: string, errors?: object[]) {
    super(message);
    this.errors = errors ?? [];
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", errors?: object[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static internalError(message = "Internal server error") {
    return new ApiError(500, message);
  }
}
export default ApiError;
