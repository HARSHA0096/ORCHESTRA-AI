import type { FastifyInstance } from 'fastify';
import { authenticateJwt, validateBody } from '@orchestra/middleware';
import { createApiKeySchema } from '@orchestra/validation';
import { ApiKeysRepository } from './api-keys.repository.js';
import { ApiKeysService } from './api-keys.service.js';
import { createApiKeysController } from './api-keys.controller.js';

export async function apiKeyRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new ApiKeysRepository();
  const service = new ApiKeysService(repo);
  const controller = createApiKeysController(service);

  fastify.post('/:projectId/api-keys', {
    schema: { tags: ['API Keys'], description: 'Generate a new API key', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, validateBody(createApiKeySchema)],
    handler: controller.generate,
  });

  fastify.get('/:projectId/api-keys', {
    schema: { tags: ['API Keys'], description: 'List project API keys', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.list,
  });

  fastify.get('/:projectId/api-keys/:apiKeyId', {
    schema: { tags: ['API Keys'], description: 'Get API key details', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.getById,
  });

  fastify.post('/:projectId/api-keys/:apiKeyId/rotate', {
    schema: { tags: ['API Keys'], description: 'Rotate API key', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.rotate,
  });

  fastify.post('/:projectId/api-keys/:apiKeyId/revoke', {
    schema: { tags: ['API Keys'], description: 'Revoke API key', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.revoke,
  });

  fastify.delete('/:projectId/api-keys/:apiKeyId', {
    schema: { tags: ['API Keys'], description: 'Delete API key', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.delete,
  });
}
