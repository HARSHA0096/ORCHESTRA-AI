import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateJwt } from '@orchestra/middleware';
import { NotificationsRepository } from './notifications.repository.js';
import { NotificationsService } from './notifications.service.js';

export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new NotificationsRepository();
  const service = new NotificationsService(repo);

  fastify.get('/', {
    schema: { tags: ['Notifications'], description: 'List user notifications', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as { page?: number; perPage?: number };
      const result = await service.getUserNotifications(request.user!.sub, { page: query.page ?? 1, perPage: query.perPage ?? 20 });
      return reply.send({ success: true, message: 'Notifications retrieved', data: result.data, meta: result.meta, requestId: request.id, timestamp: new Date().toISOString() });
    },
  });

  fastify.patch('/:notificationId/read', {
    schema: { tags: ['Notifications'], description: 'Mark notification as read', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { notificationId } = request.params as { notificationId: string };
      await service.markAsRead(notificationId);
      return reply.send({ success: true, message: 'Notification marked as read', data: null, requestId: request.id, timestamp: new Date().toISOString() });
    },
  });

  fastify.patch('/read-all', {
    schema: { tags: ['Notifications'], description: 'Mark all notifications as read', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      await service.markAllAsRead(request.user!.sub);
      return reply.send({ success: true, message: 'All notifications marked as read', data: null, requestId: request.id, timestamp: new Date().toISOString() });
    },
  });

  fastify.get('/unread-count', {
    schema: { tags: ['Notifications'], description: 'Get unread notification count', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const count = await service.getUnreadCount(request.user!.sub);
      return reply.send({ success: true, message: 'Unread count retrieved', data: { count }, requestId: request.id, timestamp: new Date().toISOString() });
    },
  });
}
