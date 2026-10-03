import type { FastifyRequest, FastifyReply } from 'fastify';
import type { OrchestraRequest } from './request-types.js';
import { ForbiddenError, ErrorCode } from '@orchestra/errors';

export function authorize(...allowedRoles: string[]) {
  return async function authorizeHandler(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const user = (request as OrchestraRequest).user;
    if (!user) {
      throw new ForbiddenError('Authentication required', ErrorCode.AUTH_FORBIDDEN);
    }
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError(
        `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`,
        ErrorCode.AUTH_FORBIDDEN,
      );
    }
  };
}
