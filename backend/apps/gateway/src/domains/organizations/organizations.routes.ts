import type { FastifyInstance } from 'fastify';
import { authenticateJwt, resolveOrganization, validateBody } from '@orchestra/middleware';
import { authorize } from '@orchestra/middleware';
import { createOrganizationSchema, updateOrganizationSchema, inviteMemberSchema, updateMemberRoleSchema } from '@orchestra/validation';
import { OrganizationsRepository } from './organizations.repository.js';
import { OrganizationsService } from './organizations.service.js';
import { createOrganizationsController } from './organizations.controller.js';

export async function organizationRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new OrganizationsRepository();
  const service = new OrganizationsService(repo);
  const controller = createOrganizationsController(service);

  fastify.post('/', {
    schema: { tags: ['Organizations'], description: 'Create organization', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, validateBody(createOrganizationSchema)],
    handler: controller.create,
  });

  fastify.get('/', {
    schema: { tags: ['Organizations'], description: 'List user organizations', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.list,
  });

  fastify.get('/:orgId', {
    schema: { tags: ['Organizations'], description: 'Get organization by ID', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization],
    handler: controller.getById,
  });

  fastify.patch('/:orgId', {
    schema: { tags: ['Organizations'], description: 'Update organization', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization, authorize('ORG_ADMIN', 'SUPER_ADMIN'), validateBody(updateOrganizationSchema)],
    handler: controller.update,
  });

  fastify.delete('/:orgId', {
    schema: { tags: ['Organizations'], description: 'Delete organization', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization, authorize('ORG_ADMIN', 'SUPER_ADMIN')],
    handler: controller.delete,
  });

  fastify.get('/:orgId/members', {
    schema: { tags: ['Organizations'], description: 'List organization members', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization],
    handler: controller.getMembers,
  });

  fastify.post('/:orgId/members/invite', {
    schema: { tags: ['Organizations'], description: 'Invite member', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization, authorize('ORG_ADMIN', 'SUPER_ADMIN'), validateBody(inviteMemberSchema)],
    handler: controller.inviteMember,
  });

  fastify.patch('/:orgId/members/:memberId', {
    schema: { tags: ['Organizations'], description: 'Update member role', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization, authorize('ORG_ADMIN', 'SUPER_ADMIN'), validateBody(updateMemberRoleSchema)],
    handler: controller.updateMemberRole,
  });

  fastify.delete('/:orgId/members/:memberId', {
    schema: { tags: ['Organizations'], description: 'Remove member', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization, authorize('ORG_ADMIN', 'SUPER_ADMIN')],
    handler: controller.removeMember,
  });
}
