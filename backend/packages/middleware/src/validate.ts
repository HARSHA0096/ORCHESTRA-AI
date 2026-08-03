import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ZodSchema } from 'zod';
import { ValidationError } from '@orchestra/errors';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async function validateBodyHandler(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code,
        })),
      );
    }
    request.body = result.data;
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async function validateQueryHandler(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code,
        })),
      );
    }
    (request as FastifyRequest & { query: T }).query = result.data;
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return async function validateParamsHandler(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code,
        })),
      );
    }
    (request as FastifyRequest & { params: T }).params = result.data;
  };
}
