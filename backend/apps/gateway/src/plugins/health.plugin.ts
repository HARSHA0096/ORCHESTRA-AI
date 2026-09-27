import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { database } from '@orchestra/database';
import { redis } from '@orchestra/redis';
import { config } from '@orchestra/config';

interface HealthCheckResult {
  status: 'up' | 'down';
  latencyMs: number;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
  };
  version: string;
  environment: string;
  demoMode: boolean;
  timestamp: string;
}

interface StatusResponse {
  version: string;
  environment: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  pid: number;
  nodeVersion: string;
  timestamp: string;
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const start = performance.now();
  try {
    await database.healthCheck();
    return {
      status: 'up',
      latencyMs: Math.round((performance.now() - start) * 100) / 100,
    };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Math.round((performance.now() - start) * 100) / 100,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

async function checkRedis(): Promise<HealthCheckResult> {
  const start = performance.now();
  try {
    await redis.healthCheck();
    return {
      status: 'up',
      latencyMs: Math.round((performance.now() - start) * 100) / 100,
    };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Math.round((performance.now() - start) * 100) / 100,
      error: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}

async function getHealthStatus(): Promise<HealthResponse> {
  const [dbCheck, redisCheck] = await Promise.all([checkDatabase(), checkRedis()]);

  let status: HealthResponse['status'] = 'healthy';
  if (dbCheck.status === 'down' && redisCheck.status === 'down') {
    status = 'unhealthy';
  } else if (dbCheck.status === 'down' || redisCheck.status === 'down') {
    status = 'degraded';
  }

  return {
    status,
    checks: {
      database: dbCheck,
      redis: redisCheck,
    },
    version: '0.1.0',
    environment: process.env['NODE_ENV'] ?? 'development',
    demoMode: (config.demo?.enabled ?? false),
    timestamp: new Date().toISOString(),
  };
}

async function healthPluginImpl(fastify: FastifyInstance): Promise<void> {
  // GET /health — overall health check
  fastify.get(
    '/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['System'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
              checks: {
                type: 'object',
                properties: {
                  database: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      latencyMs: { type: 'number' },
                      error: { type: 'string' },
                    },
                  },
                  redis: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      latencyMs: { type: 'number' },
                      error: { type: 'string' },
                    },
                  },
                },
              },
              version: { type: 'string' },
              environment: { type: 'string' },
              demoMode: { type: 'boolean' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      const health = await getHealthStatus();
      return health;
    },
  );

  // GET /ready — readiness probe (503 if any dependency is down)
  fastify.get(
    '/ready',
    {
      schema: {
        description: 'Readiness probe for orchestrators',
        tags: ['System'],
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const health = await getHealthStatus();
      const statusCode = health.status === 'unhealthy' || health.status === 'degraded' ? 503 : 200;
      return reply.status(statusCode).send(health);
    },
  );

  // GET /live — liveness probe (always returns alive)
  fastify.get(
    '/live',
    {
      schema: {
        description: 'Liveness probe',
        tags: ['System'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      return { status: 'alive' };
    },
  );

  // GET /status — detailed system status
  fastify.get(
    '/status',
    {
      schema: {
        description: 'System status with memory and uptime info',
        tags: ['System'],
      },
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      const response: StatusResponse = {
        version: '0.1.0',
        environment: process.env['NODE_ENV'] ?? 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      };
      return response;
    },
  );
}

export const healthPlugin = fp(healthPluginImpl, {
  name: 'health-plugin',
});
