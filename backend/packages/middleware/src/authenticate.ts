import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '@orchestra/auth';
import { UnauthorizedError, ErrorCode } from '@orchestra/errors';

export async function authenticateJwt(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header', ErrorCode.AUTH_UNAUTHORIZED);
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);
  request.user = payload;
  request.requestContext.userId = payload.sub;
}
