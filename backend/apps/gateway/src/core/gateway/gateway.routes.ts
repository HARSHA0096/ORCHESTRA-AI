import type { FastifyInstance } from 'fastify';
import { authenticateJwt } from '@orchestra/middleware';
import { GatewayService } from './gateway.service.js';
import { createGatewayController } from './gateway.controller.js';

export async function gatewayRoutes(fastify: FastifyInstance): Promise<void> {
  const service = new GatewayService();
  const controller = createGatewayController(service);

  fastify.post('/', {
    schema: {
      tags: ['Gateway'],
      description: 'Execute an AI request through the middleware core',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticateJwt],
    handler: controller.execute,
  });
}
