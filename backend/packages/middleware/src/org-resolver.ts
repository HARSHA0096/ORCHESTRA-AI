import type { FastifyRequest, FastifyReply } from 'fastify';
import type { OrchestraRequest } from './request-types.js';
import { prisma } from '@orchestra/database';
import { ForbiddenError, NotFoundError, ErrorCode } from '@orchestra/errors';

export async function resolveOrganization(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const orchestraRequest = request as OrchestraRequest;
  const user = orchestraRequest.user;
  if (!user) {
    throw new ForbiddenError('Authentication required', ErrorCode.AUTH_FORBIDDEN);
  }

  const params = request.params as Record<string, string>;
  const orgId = params['orgId'] ?? (request.headers['x-org-id'] as string | undefined);

  if (!orgId) {
    throw new ForbiddenError('Organization ID required', ErrorCode.ORG_NOT_FOUND);
  }

  const membership = await prisma.orgMembership.findFirst({
    where: {
      userId: user.sub,
      organizationId: orgId,
      deletedAt: null,
    },
  });

  if (!membership) {
    throw new NotFoundError('Organization not found or access denied', ErrorCode.ORG_NOT_FOUND);
  }

  orchestraRequest.organization = {
    id: orgId,
    role: membership.role,
  };
  orchestraRequest.requestContext.organizationId = orgId;
}
