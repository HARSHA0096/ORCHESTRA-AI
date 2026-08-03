import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateJwt, resolveOrganization } from '@orchestra/middleware';
import { authorize } from '@orchestra/middleware';
import { AuditRepository } from './audit.repository.js';
import { AuditService } from './audit.service.js';

export async function auditRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new AuditRepository();
  const service = new AuditService(repo);

  fastify.get('/:orgId/audit-logs', {
    schema: { tags: ['Audit'], description: 'List organization audit logs', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization, authorize('ORG_ADMIN', 'SUPER_ADMIN')],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { orgId } = request.params as { orgId: string };
      const query = request.query as { page?: number; perPage?: number; action?: string; resource?: string };
      const result = await service.getOrgAuditLogs(orgId, { page: query.page ?? 1, perPage: query.perPage ?? 20 }, { action: query.action, resource: query.resource });
      return reply.send({ success: true, message: 'Audit logs retrieved', data: result.data, meta: result.meta, requestId: request.id, timestamp: new Date().toISOString() });
    },
  });
}
