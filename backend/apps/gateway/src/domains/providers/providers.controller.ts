import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '@orchestra/shared';
import { ProvidersService } from './providers.service.js';

export function createProvidersController(service: ProvidersService) {
  return {
    async list(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as { page?: number; perPage?: number };
      const result = await service.listProviders({ page: query.page ?? 1, perPage: query.perPage ?? 20 });
      return reply.send({ success: true, message: 'Providers retrieved', data: result.data, meta: result.meta, requestId: request.id, timestamp: new Date().toISOString() });
    },
    async get(request: FastifyRequest, reply: FastifyReply) {
      const { providerId } = request.params as { providerId: string };
      const provider = await service.getProvider(providerId);
      const response: ApiResponse<typeof provider> = { success: true, message: 'Provider retrieved', data: provider, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },
    async create(request: FastifyRequest, reply: FastifyReply) {
      const provider = await service.createProvider(request.body as Parameters<typeof service.createProvider>[0]);
      const response: ApiResponse<typeof provider> = { success: true, message: 'Provider created', data: provider, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.status(201).send(response);
    },
    async update(request: FastifyRequest, reply: FastifyReply) {
      const { providerId } = request.params as { providerId: string };
      const provider = await service.updateProvider(providerId, request.body as Parameters<typeof service.updateProvider>[1]);
      const response: ApiResponse<typeof provider> = { success: true, message: 'Provider updated', data: provider, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },
    async listModels(request: FastifyRequest, reply: FastifyReply) {
      const { providerId } = request.params as { providerId: string };
      const models = await service.listModels(providerId);
      const response: ApiResponse<typeof models> = { success: true, message: 'Models retrieved', data: models, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },
  };
}
