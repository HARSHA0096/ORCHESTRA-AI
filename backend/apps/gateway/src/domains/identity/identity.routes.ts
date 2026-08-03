import type { FastifyInstance } from 'fastify';
import { authenticateJwt } from '@orchestra/middleware';
import { validateBody } from '@orchestra/middleware';
import { registerSchema, loginSchema, refreshTokenSchema, updateProfileSchema } from '@orchestra/validation';
import { IdentityRepository } from './identity.repository.js';
import { IdentityService } from './identity.service.js';
import { createIdentityController } from './identity.controller.js';

export async function identityRoutes(fastify: FastifyInstance): Promise<void> {
  const repository = new IdentityRepository();
  const service = new IdentityService(repository);
  const controller = createIdentityController(service);

  // Public routes
  fastify.post('/register', {
    schema: { tags: ['Auth'], description: 'Register a new user account' },
    preHandler: [validateBody(registerSchema)],
    handler: controller.register,
  });

  fastify.post('/login', {
    schema: { tags: ['Auth'], description: 'Login with email and password' },
    preHandler: [validateBody(loginSchema)],
    handler: controller.login,
  });

  fastify.post('/refresh', {
    schema: { tags: ['Auth'], description: 'Refresh access token' },
    preHandler: [validateBody(refreshTokenSchema)],
    handler: controller.refresh,
  });

  // Protected routes
  fastify.post('/logout', {
    schema: { tags: ['Auth'], description: 'Logout current session', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.logout,
  });

  fastify.get('/me', {
    schema: { tags: ['Auth'], description: 'Get current user profile', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.getProfile,
  });

  fastify.patch('/me', {
    schema: { tags: ['Auth'], description: 'Update current user profile', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt, validateBody(updateProfileSchema)],
    handler: controller.updateProfile,
  });

  fastify.get('/sessions', {
    schema: { tags: ['Auth'], description: 'List active sessions', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.getSessions,
  });

  fastify.delete('/sessions/:sessionId', {
    schema: { tags: ['Auth'], description: 'Revoke a specific session', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.revokeSession,
  });

  fastify.delete('/sessions', {
    schema: { tags: ['Auth'], description: 'Revoke all sessions', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.revokeAllSessions,
  });
}
