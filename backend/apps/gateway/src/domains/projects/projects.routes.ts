import type { FastifyInstance } from 'fastify';
import { authenticateJwt, resolveOrganization, validateBody } from '@orchestra/middleware';
import { authorize } from '@orchestra/middleware';
import { createProjectSchema, updateProjectSchema } from '@orchestra/validation';
import { ProjectsRepository } from './projects.repository.js';
import { ProjectsService } from './projects.service.js';
import { createProjectsController } from './projects.controller.js';

export async function projectRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new ProjectsRepository();
  const service = new ProjectsService(repo);
  const controller = createProjectsController(service);

  fastify.post('/:orgId/projects', {
    schema: { tags: ['Projects'], description: 'Create project', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization, validateBody(createProjectSchema)],
    handler: controller.create,
  });

  fastify.get('/:orgId/projects', {
    schema: { tags: ['Projects'], description: 'List organization projects', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization],
    handler: controller.list,
  });

  fastify.get('/:orgId/projects/:projectId', {
    schema: { tags: ['Projects'], description: 'Get project by ID', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization],
    handler: controller.getById,
  });

  fastify.patch('/:orgId/projects/:projectId', {
    schema: { tags: ['Projects'], description: 'Update project', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization, validateBody(updateProjectSchema)],
    handler: controller.update,
  });

  fastify.delete('/:orgId/projects/:projectId', {
    schema: { tags: ['Projects'], description: 'Delete project', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization, authorize('ORG_ADMIN', 'SUPER_ADMIN')],
    handler: controller.delete,
  });

  fastify.post('/:orgId/projects/:projectId/archive', {
    schema: { tags: ['Projects'], description: 'Archive project', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization],
    handler: controller.archive,
  });

  fastify.post('/:orgId/projects/:projectId/duplicate', {
    schema: { tags: ['Projects'], description: 'Duplicate project', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, resolveOrganization],
    handler: controller.duplicate,
  });
}
