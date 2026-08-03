import fp from 'fastify-plugin';
import { Server as SocketIOServer } from 'socket.io';
import type { FastifyInstance } from 'fastify';

import { config } from '@orchestra/config';
import { verifyAccessToken } from '@orchestra/auth';
import { logger } from '@orchestra/logger';

// ──────────────────────────────────────────────
// Module augmentation for Fastify
// ──────────────────────────────────────────────
declare module 'fastify' {
  interface FastifyInstance {
    io: SocketIOServer;
  }
}

async function websocketPluginImpl(fastify: FastifyInstance): Promise<void> {
  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // ── Connection authentication middleware ──
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth['token'] as string | undefined;

      if (!token) {
        next(new Error('Authentication required: no token provided'));
        return;
      }

      const payload = verifyAccessToken(token);
      socket.data['user'] = payload;

      logger.debug(
        { userId: payload.sub, socketId: socket.id },
        'WebSocket authenticated',
      );

      next();
    } catch (error) {
      logger.warn(
        { socketId: socket.id, error: error instanceof Error ? error.message : 'unknown' },
        'WebSocket authentication failed',
      );
      next(new Error('Authentication failed: invalid token'));
    }
  });

  // ── Connection handler ──
  io.on('connection', (socket) => {
    const user = socket.data['user'] as { sub: string; organizationId?: string } | undefined;

    if (!user) {
      socket.disconnect(true);
      return;
    }

    logger.info(
      { userId: user.sub, socketId: socket.id },
      'WebSocket client connected',
    );

    // Join user's personal room
    void socket.join(`user:${user.sub}`);

    // Join user's organization room if they have one
    if (user.organizationId) {
      void socket.join(`org:${user.organizationId}`);
    }

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(
        { userId: user.sub, socketId: socket.id, reason },
        'WebSocket client disconnected',
      );
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(
        { userId: user.sub, socketId: socket.id, error: error.message },
        'WebSocket error',
      );
    });
  });

  // Decorate Fastify instance with Socket.IO server
  fastify.decorate('io', io);

  // Clean up on close
  fastify.addHook('onClose', async () => {
    logger.info('Closing WebSocket server...');
    await new Promise<void>((resolve) => {
      io.close(() => {
        resolve();
      });
    });
    logger.info('WebSocket server closed');
  });
}

export const websocketPlugin = fp(websocketPluginImpl, {
  name: 'websocket-plugin',
});
