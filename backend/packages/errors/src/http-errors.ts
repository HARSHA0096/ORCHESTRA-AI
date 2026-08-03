import { AppError } from './app-error.js';
import { ErrorCode } from './error-codes.js';
import type { ErrorCode as ErrorCodeType } from './error-codes.js';

export class BadRequestError extends AppError {
  constructor(
    message = 'Bad request',
    errorCode: ErrorCodeType = ErrorCode.VALIDATION_ERROR,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 400, errorCode, true, metadata);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = 'Unauthorized',
    errorCode: ErrorCodeType = ErrorCode.AUTH_UNAUTHORIZED,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 401, errorCode, true, metadata);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = 'Forbidden',
    errorCode: ErrorCodeType = ErrorCode.AUTH_FORBIDDEN,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 403, errorCode, true, metadata);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(
    message = 'Resource not found',
    errorCode: ErrorCodeType = ErrorCode.NOT_FOUND,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 404, errorCode, true, metadata);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(
    message = 'Resource conflict',
    errorCode: ErrorCodeType = ErrorCode.CONFLICT,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 409, errorCode, true, metadata);
    this.name = 'ConflictError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message = 'Too many requests',
    errorCode: ErrorCodeType = ErrorCode.RATE_LIMIT_EXCEEDED,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 429, errorCode, true, metadata);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = 'Internal server error',
    errorCode: ErrorCodeType = ErrorCode.INTERNAL_ERROR,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 500, errorCode, false, metadata);
    this.name = 'InternalServerError';
  }
}

export class ValidationError extends AppError {
  public readonly issues: Array<{ path: string; message: string; code: string }>;

  constructor(
    issues: Array<{ path: string; message: string; code: string }>,
    message = 'Validation failed',
  ) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, true, { issues });
    this.name = 'ValidationError';
    this.issues = issues;
  }
}
