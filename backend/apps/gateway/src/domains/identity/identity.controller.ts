import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '@orchestra/shared';
import { IdentityService } from './identity.service.js';

export function createIdentityController(service: IdentityService) {
  return {
    async register(request: FastifyRequest, reply: FastifyReply) {
      const result = await service.register(
        request.body as Parameters<typeof service.register>[0],
        request.ip,
        request.headers['user-agent'],
      );
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Registration successful',
        data: result,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };
      return reply.status(201).send(response);
    },

    async login(request: FastifyRequest, reply: FastifyReply) {
      const result = await service.login(
        request.body as Parameters<typeof service.login>[0],
        request.ip,
        request.headers['user-agent'],
      );
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Login successful',
        data: result,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };
      return reply.send(response);
    },

    async logout(request: FastifyRequest, reply: FastifyReply) {
      await service.logout(request.user!.sessionId);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Logout successful',
        data: null,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };
      return reply.send(response);
    },

    async refresh(request: FastifyRequest, reply: FastifyReply) {
      const { refreshToken } = request.body as { refreshToken: string };
      const tokens = await service.refreshToken(refreshToken);
      const response: ApiResponse<typeof tokens> = {
        success: true,
        message: 'Token refreshed',
        data: tokens,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };
      return reply.send(response);
    },

    async getProfile(request: FastifyRequest, reply: FastifyReply) {
      const profile = await service.getProfile(request.user!.sub);
      const response: ApiResponse<typeof profile> = {
        success: true,
        message: 'Profile retrieved',
        data: profile,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };
      return reply.send(response);
    },

    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
      const profile = await service.updateProfile(
        request.user!.sub,
        request.body as Parameters<typeof service.updateProfile>[1],
      );
      const response: ApiResponse<typeof profile> = {
        success: true,
        message: 'Profile updated',
        data: profile,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };
      return reply.send(response);
    },

    async getSessions(request: FastifyRequest, reply: FastifyReply) {
      const sessions = await service.getSessions(request.user!.sub);
      const response: ApiResponse<typeof sessions> = {
        success: true,
        message: 'Sessions retrieved',
        data: sessions,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };
      return reply.send(response);
    },

    async revokeSession(request: FastifyRequest, reply: FastifyReply) {
      const { sessionId } = request.params as { sessionId: string };
      await service.revokeSession(request.user!.sub, sessionId);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Session revoked',
        data: null,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };
      return reply.send(response);
    },

    async revokeAllSessions(request: FastifyRequest, reply: FastifyReply) {
      await service.revokeAllSessions(request.user!.sub);
      const response: ApiResponse<null> = {
        success: true,
        message: 'All sessions revoked',
        data: null,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };
      return reply.send(response);
    },
  };
}
