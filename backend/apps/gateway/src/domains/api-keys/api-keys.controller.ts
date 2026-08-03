import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '@orchestra/shared';
import { ApiKeysService } from './api-keys.service.js';

export function createApiKeysController(service: ApiKeysService) {
  return {
    async generate(request: FastifyRequest, reply: FastifyReply) {
      const { projectId } = request.params as { projectId: string };
      const result = await service.generate(projectId, request.organization!.id, request.user!.sub, request.body as Parameters<typeof service.generate>[3]);
      const response: ApiResponse<typeof result> = { success: true, message: 'API key generated. Store the raw key securely — it cannot be retrieved again.', data: result, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.status(201).send(response);
    },

    async list(request: FastifyRequest, reply: FastifyReply) {
      const { projectId } = request.params as { projectId: string };
      const query = request.query as { page?: number; perPage?: number };
      const result = await service.getByProject(projectId, { page: query.page ?? 1, perPage: query.perPage ?? 20 });
      return reply.send({ success: true, message: 'API keys retrieved', data: result.data, meta: result.meta, requestId: request.id, timestamp: new Date().toISOString() });
    },

    async getById(request: FastifyRequest, reply: FastifyReply) {
      const { apiKeyId } = request.params as { apiKeyId: string };
      const key = await service.getById(apiKeyId);
      const response: ApiResponse<typeof key> = { success: true, message: 'API key retrieved', data: key, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async rotate(request: FastifyRequest, reply: FastifyReply) {
      const { projectId, apiKeyId } = request.params as { projectId: string; apiKeyId: string };
      const result = await service.rotate(projectId, request.organization!.id, apiKeyId, request.user!.sub);
      const response: ApiResponse<typeof result> = { success: true, message: 'API key rotated. Store the new raw key securely.', data: result, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async revoke(request: FastifyRequest, reply: FastifyReply) {
      const { apiKeyId } = request.params as { apiKeyId: string };
      await service.revoke(apiKeyId);
      const response: ApiResponse<null> = { success: true, message: 'API key revoked', data: null, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
      const { apiKeyId } = request.params as { apiKeyId: string };
      await service.delete(apiKeyId);
      const response: ApiResponse<null> = { success: true, message: 'API key deleted', data: null, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },
  };
}
