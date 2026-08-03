import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '@orchestra/shared';
import { OrganizationsService } from './organizations.service.js';

export function createOrganizationsController(service: OrganizationsService) {
  return {
    async create(request: FastifyRequest, reply: FastifyReply) {
      const org = await service.create(request.user!.sub, request.body as Parameters<typeof service.create>[1]);
      const response: ApiResponse<typeof org> = { success: true, message: 'Organization created', data: org, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.status(201).send(response);
    },

    async list(request: FastifyRequest, reply: FastifyReply) {
      const orgs = await service.getUserOrganizations(request.user!.sub);
      const response: ApiResponse<typeof orgs> = { success: true, message: 'Organizations retrieved', data: orgs, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async getById(request: FastifyRequest, reply: FastifyReply) {
      const { orgId } = request.params as { orgId: string };
      const org = await service.getById(orgId);
      const response: ApiResponse<typeof org> = { success: true, message: 'Organization retrieved', data: org, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
      const { orgId } = request.params as { orgId: string };
      const org = await service.update(orgId, request.body as Parameters<typeof service.update>[1]);
      const response: ApiResponse<typeof org> = { success: true, message: 'Organization updated', data: org, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
      const { orgId } = request.params as { orgId: string };
      await service.delete(orgId);
      const response: ApiResponse<null> = { success: true, message: 'Organization deleted', data: null, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async getMembers(request: FastifyRequest, reply: FastifyReply) {
      const { orgId } = request.params as { orgId: string };
      const members = await service.getMembers(orgId);
      const response: ApiResponse<typeof members> = { success: true, message: 'Members retrieved', data: members, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async inviteMember(request: FastifyRequest, reply: FastifyReply) {
      const { orgId } = request.params as { orgId: string };
      const member = await service.inviteMember(orgId, request.user!.sub, request.body as Parameters<typeof service.inviteMember>[2]);
      const response: ApiResponse<typeof member> = { success: true, message: 'Member invited', data: member, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.status(201).send(response);
    },

    async updateMemberRole(request: FastifyRequest, reply: FastifyReply) {
      const { orgId, memberId } = request.params as { orgId: string; memberId: string };
      const member = await service.updateMemberRole(orgId, request.user!.sub, memberId, request.body as Parameters<typeof service.updateMemberRole>[3]);
      const response: ApiResponse<typeof member> = { success: true, message: 'Member role updated', data: member, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },

    async removeMember(request: FastifyRequest, reply: FastifyReply) {
      const { orgId, memberId } = request.params as { orgId: string; memberId: string };
      await service.removeMember(orgId, request.user!.sub, memberId);
      const response: ApiResponse<null> = { success: true, message: 'Member removed', data: null, requestId: request.id, timestamp: new Date().toISOString() };
      return reply.send(response);
    },
  };
}
