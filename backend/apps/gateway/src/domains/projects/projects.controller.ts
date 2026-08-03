import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '@orchestra/shared';
import { ProjectsService } from './projects.service.js';

export function createProjectsController(service: ProjectsService) {
  return {
    async create(request: FastifyRequest, reply: FastifyReply) {
      const { orgId } = request.params as { orgId: string };
      const project = await service.create(orgId, request.user!.sub, request.body as Parameters<typeof service.create>[2]);
      const response: ApiResponse<typeof project> = { success: true, message: 'Project created', data: project, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.status(201).send(response);
    },

    async list(request: FastifyRequest, reply: FastifyReply) {
      const { orgId } = request.params as { orgId: string };
      const query = request.query as { page?: number; perPage?: number };
      const result = await service.getByOrg(orgId, { page: query.page ?? 1, perPage: query.perPage ?? 20 });
      return reply.send({ success: true, message: 'Projects retrieved', data: result.data, meta: result.meta, requestId: request.id, timestamp: new Date().toISOString() });
    },

    async getById(request: FastifyRequest, reply: FastifyReply) {
      const { projectId } = request.params as { projectId: string };
      const project = await service.getById(projectId);
      const response: ApiResponse<typeof project> = { success: true, message: 'Project retrieved', data: project, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
      const { projectId } = request.params as { projectId: string };
      const project = await service.update(projectId, request.body as Parameters<typeof service.update>[1]);
      const response: ApiResponse<typeof project> = { success: true, message: 'Project updated', data: project, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
      const { projectId } = request.params as { projectId: string };
      await service.delete(projectId);
      const response: ApiResponse<null> = { success: true, message: 'Project deleted', data: null, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async archive(request: FastifyRequest, reply: FastifyReply) {
      const { projectId } = request.params as { projectId: string };
      const project = await service.archive(projectId);
      const response: ApiResponse<typeof project> = { success: true, message: 'Project archived', data: project, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async duplicate(request: FastifyRequest, reply: FastifyReply) {
      const { orgId, projectId } = request.params as { orgId: string; projectId: string };
      const project = await service.duplicate(orgId, request.user!.sub, projectId);
      const response: ApiResponse<typeof project> = { success: true, message: 'Project duplicated', data: project, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.status(201).send(response);
    },
  };
}
