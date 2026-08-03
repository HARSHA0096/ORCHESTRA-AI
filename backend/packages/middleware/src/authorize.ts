import type { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError, ErrorCode } from '@orchestra/errors';

export function authorize(...allowedRoles: string[]) {
  return async function authorizeHandler(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const user = request.user;
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
