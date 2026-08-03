import { config } from '@orchestra/config';
import { logger } from '@orchestra/logger';
import { database } from '@orchestra/database';
import { redis } from '@orchestra/redis';
import { buildApp } from './app.js';

// ──────────────────────────────────────────────
// Validate configuration (fail fast)
// ──────────────────────────────────────────────
logger.info({ env: config.app.env }, 'Configuration validated successfully');

// ──────────────────────────────────────────────
// Boot sequence
// ──────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    // 1. Connect to database
    logger.info('Connecting to database...');
    await database.connect();
    logger.info('Database connected');

    // 2. Connect to Redis
    logger.info('Connecting to Redis...');
    await redis.connect();
    logger.info('Redis connected');

    // 3. Build Fastify app
    const app = await buildApp();

    // 4. Listen
    const address = await app.listen({
      port: config.app.port,
      host: config.app.host,
    });

    logger.info(
      {
        address,
        env: config.app.env,
        port: config.app.port,
        host: config.app.host,
        pid: process.pid,
        nodeVersion: process.version,
      },
      `🎵 Orchestra AI Gateway running at ${address}`,
    );

    logger.info(`📚 API docs available at ${address}/docs`);

    // ── Graceful shutdown ──
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown...');

      try {
        // Close Fastify (stops accepting new connections, finishes in-flight)
        await app.close();
        logger.info('Fastify server closed');

        // Disconnect database
        await database.disconnect();
        logger.info('Database disconnected');

        // Disconnect Redis
        await redis.disconnect();
        logger.info('Redis disconnected');

        logger.info('Graceful shutdown complete');
        process.exit(0);
      } catch (shutdownError) {
        logger.error({ err: shutdownError }, 'Error during graceful shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => {
      void shutdown('SIGTERM');
    });

    process.on('SIGINT', () => {
      void shutdown('SIGINT');
    });
  } catch (startupError) {
    logger.fatal({ err: startupError }, 'Failed to start Orchestra AI Gateway');
    process.exit(1);
  }
}

// ──────────────────────────────────────────────
// Global exception handlers
// ──────────────────────────────────────────────
process.on('uncaughtException', (error: Error) => {
  logger.fatal({ err: error }, 'Uncaught exception - shutting down');
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection - shutting down');
  process.exit(1);
});

// ── Start the server ──
void start();
