import type { FastifyInstance } from 'fastify';
import { authenticateJwt } from '@orchestra/middleware';
import { authorize } from '@orchestra/middleware';
import { ProvidersRepository } from './providers.repository.js';
import { ProvidersService } from './providers.service.js';
import { createProvidersController } from './providers.controller.js';

export async function providerRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new ProvidersRepository();
  const service = new ProvidersService(repo);
  const controller = createProvidersController(service);

  fastify.get('/', { schema: { tags: ['Providers'], description: 'List providers', security: [{ bearerAuth: [] }] }, preHandler: [authenticateJwt], handler: controller.list });
  fastify.get('/:providerId', { schema: { tags: ['Providers'], description: 'Get provider', security: [{ bearerAuth: [] }] }, preHandler: [authenticateJwt], handler: controller.get });
  fastify.post('/', { schema: { tags: ['Providers'], description: 'Create provider (admin)', security: [{ bearerAuth: [] }] }, preHandler: [authenticateJwt, authorize('SUPER_ADMIN')], handler: controller.create });
  fastify.patch('/:providerId', { schema: { tags: ['Providers'], description: 'Update provider (admin)', security: [{ bearerAuth: [] }] }, preHandler: [authenticateJwt, authorize('SUPER_ADMIN')], handler: controller.update });
  fastify.get('/:providerId/models', { schema: { tags: ['Providers'], description: 'List provider models', security: [{ bearerAuth: [] }] }, preHandler: [authenticateJwt], handler: controller.listModels });
}
