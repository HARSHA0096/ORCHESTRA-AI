import crypto from 'node:crypto';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ZodError } from 'zod';

import { config } from '@orchestra/config';
import { logger } from '@orchestra/logger';
import { AppError } from '@orchestra/errors';
import { redis } from '@orchestra/redis';
import type { ApiResponse, RequestContext } from '@orchestra/shared';

import { healthPlugin } from './plugins/health.plugin.js';
import { websocketPlugin } from './plugins/websocket.plugin.js';
import { identityRoutes } from './domains/identity/identity.routes.js';
import { organizationRoutes } from './domains/organizations/organizations.routes.js';
import { projectRoutes } from './domains/projects/projects.routes.js';
import { apiKeyRoutes } from './domains/api-keys/api-keys.routes.js';
import { providerRoutes } from './domains/providers/providers.routes.js';
import { auditRoutes } from './domains/audit/audit.routes.js';
import { notificationRoutes } from './domains/notifications/notifications.routes.js';
import { telemetryRoutes } from './domains/telemetry/telemetry.routes.js';
import { gatewayRoutes, openAiCompatibleRoutes } from './core/gateway/gateway.routes.js';
import { demoObservabilityRoutes } from './core/gateway/demo.routes.js';

// ──────────────────────────────────────────────
// App factory
// ──────────────────────────────────────────────
export async function buildApp(): Promise<FastifyInstance<any, any, any, any>> {
  const app = Fastify({
    loggerInstance: logger,
    requestIdHeader: 'x-request-id',
    genReqId: () => crypto.randomUUID(),
    bodyLimit: config.rateLimit.maxBodySize,
  });

  // Process-local operational metrics. These are intentionally lightweight and
  // complement persisted RequestEvent telemetry with instance-level health data.
  let totalRequests = 0;
  let totalErrors = 0;
  let activeRequests = 0;
  let totalDurationMs = 0;

  // ── Decorate request with custom properties ──
  app.decorateRequest('user', null);
  app.decorateRequest('organization', null);
  app.decorateRequest('apiKey', null);
  app.decorateRequest('requestContext', null as unknown as RequestContext);

  // ────────────────────────────────────────────
  // 1. Security headers (Helmet)
  // ────────────────────────────────────────────
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false, // Disabled for Swagger UI
  });

  // ────────────────────────────────────────────
  // 2. CORS
  // ────────────────────────────────────────────
  await app.register(fastifyCors, {
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Correlation-ID',
      'X-Api-Key',
      'X-Org-ID',
    ],
    exposedHeaders: ['X-Request-ID', 'X-Correlation-ID'],
  });

  // ────────────────────────────────────────────
  // 3. Compression
  // ────────────────────────────────────────────
  await app.register(fastifyCompress);

  // ────────────────────────────────────────────
  // 4. Cookie
  // ────────────────────────────────────────────
  await app.register(fastifyCookie);

  // ────────────────────────────────────────────
  // 5. Rate limiting
  // ────────────────────────────────────────────
  const rateLimitOptions: Parameters<typeof fastifyRateLimit>[1] = {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.windowMs,
  };

  // Use Redis store when available for distributed rate limiting
  try {
    const redisClient = redis.getClient();
    if (redisClient) {
      rateLimitOptions.redis = redisClient;
    }
  } catch {
    // Redis not available, use in-memory store
    app.log.warn('Redis unavailable for rate limiting, using in-memory store');
  }

  await app.register(fastifyRateLimit, rateLimitOptions);

  // ────────────────────────────────────────────
  // 6. Swagger / OpenAPI
  // ────────────────────────────────────────────
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Orchestra AI API',
        version: '0.1.0',
        description:
          'Enterprise AI middleware platform API. Provides authentication, organization management, project orchestration, and provider routing.',
        contact: {
          name: 'Orchestra AI',
        },
      },
      servers: [
        {
          url: `http://${config.app.host === '0.0.0.0' ? 'localhost' : config.app.host}:${String(config.app.port)}`,
          description: `${config.app.env} server`,
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT access token obtained via /api/v1/auth/login',
          },
          apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Api-Key',
            description: 'API key for programmatic access',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  // ────────────────────────────────────────────
  // 7. Swagger UI
  // ────────────────────────────────────────────
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
  });

  // Machine-readable OpenAPI export. Swagger UI and this document are generated
  // from the same registered Fastify routes so client tooling stays in sync.
  app.get('/openapi.json', { schema: { hide: true } }, async (_request, reply) => {
    return reply.type('application/json').send(app.swagger());
  });

  // ────────────────────────────────────────────
  // 8. Health plugin
  // ────────────────────────────────────────────
  await app.register(healthPlugin);

  // Prometheus-compatible process/request metrics for infrastructure scrapers.
  // Persisted project telemetry remains available through /api/v1/metrics.
  app.get('/metrics', async (_request, reply) => {
    const avgDuration = totalRequests > 0 ? totalDurationMs / totalRequests : 0;
    const lines = [
      '# HELP orchestra_http_requests_total Total HTTP requests handled by this gateway process.',
      '# TYPE orchestra_http_requests_total counter',
      `orchestra_http_requests_total ${totalRequests}`,
      '# HELP orchestra_http_errors_total Total HTTP 5xx responses from this gateway process.',
      '# TYPE orchestra_http_errors_total counter',
      `orchestra_http_errors_total ${totalErrors}`,
      '# HELP orchestra_http_requests_active Current in-flight HTTP requests.',
      '# TYPE orchestra_http_requests_active gauge',
      `orchestra_http_requests_active ${activeRequests}`,
      '# HELP orchestra_http_request_duration_ms_average Average HTTP request duration in milliseconds.',
      '# TYPE orchestra_http_request_duration_ms_average gauge',
      `orchestra_http_request_duration_ms_average ${avgDuration.toFixed(3)}`,
      '# HELP orchestra_process_uptime_seconds Gateway process uptime in seconds.',
      '# TYPE orchestra_process_uptime_seconds gauge',
      `orchestra_process_uptime_seconds ${process.uptime().toFixed(3)}`,
      '# HELP orchestra_process_memory_bytes Resident process memory in bytes.',
      '# TYPE orchestra_process_memory_bytes gauge',
      `orchestra_process_memory_bytes ${process.memoryUsage().rss}`,
      '',
    ].join('\n');
    return reply.type('text/plain; version=0.0.4; charset=utf-8').send(lines);
  });

  // ────────────────────────────────────────────
  // 9. Request ID + Correlation ID middleware
  // ────────────────────────────────────────────
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Request ID is already handled by Fastify's genReqId
    reply.header('x-request-id', request.id);

    // Correlation ID: use from header or generate new one
    const incomingCorrelationId = request.headers['x-correlation-id'];
    const correlationId =
      typeof incomingCorrelationId === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(incomingCorrelationId)
        ? incomingCorrelationId
        : crypto.randomUUID();
    reply.header('x-correlation-id', correlationId);

    // Attach request context
    request.requestContext = {
      requestId: request.id,
      correlationId,
      ip: request.ip,
      userAgent: request.headers['user-agent'] ?? 'unknown',
    };
    totalRequests += 1;
    activeRequests += 1;
  });

  // ────────────────────────────────────────────
  // 10. Request logger middleware
  // ────────────────────────────────────────────
  app.addHook('onRequest', async (request: FastifyRequest) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        requestId: request.id,
        correlationId: request.requestContext?.correlationId,
      },
      'incoming request',
    );
  });

  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const duration = reply.elapsedTime;
    activeRequests = Math.max(0, activeRequests - 1);
    totalDurationMs += duration;
    if (reply.statusCode >= 500) totalErrors += 1;
    reply.header('x-correlation-id', request.requestContext?.correlationId ?? '');
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs: Math.round(duration * 100) / 100,
        requestId: request.id,
      },
      'request completed',
    );
  });

  // ────────────────────────────────────────────
  // 11. Global error handler
  // ────────────────────────────────────────────
  app.setErrorHandler(
    (error: Error & { statusCode?: number; code?: string; validation?: unknown }, request: FastifyRequest, reply: FastifyReply) => {
      const requestId = request.id;
      const timestamp = new Date().toISOString();

      // Handle AppError (our custom errors)
      if (error instanceof AppError) {
        request.log.warn(
          {
            errorCode: error.errorCode,
            statusCode: error.statusCode,
            message: error.message,
            metadata: error.metadata,
          },
          'application error',
        );

        const errorResponse: ApiResponse<null> = {
          success: false,
          message: error.message,
          data: null,
          requestId,
          timestamp,
        };

        return reply.status(error.statusCode).send({
          ...errorResponse,
          error: {
            code: error.errorCode,
            ...(config.app.env !== 'production' && { details: error.metadata }),
          },
        });
      }

      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        const zodError = error as unknown as ZodError;
        const details = zodError.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        request.log.warn({ issues: details }, 'validation error');

        return reply.status(400).send({
          success: false,
          message: 'Validation failed',
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            details,
          },
          requestId,
          timestamp,
        });
      }

      // Handle Fastify validation errors (e.g. schema validation)
      if (error.validation) {
        request.log.warn({ validation: error.validation }, 'fastify validation error');

        return reply.status(400).send({
          success: false,
          message: 'Request validation failed',
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            details: error.validation,
          },
          requestId,
          timestamp,
        });
      }

      // Handle Fastify errors (rate limit, not found, etc.)
      if (error.statusCode && error.statusCode < 500) {
        request.log.warn(
          { statusCode: error.statusCode, code: error.code },
          'client error',
        );

        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
          data: null,
          error: {
            code: error.code ?? 'CLIENT_ERROR',
          },
          requestId,
          timestamp,
        });
      }

      // Unknown / internal errors
      request.log.error(
        {
          err: error,
          stack: error.stack,
        },
        'unhandled error',
      );

      return reply.status(500).send({
        success: false,
        message:
          config.app.env === 'production'
            ? 'Internal server error'
            : error.message,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          ...(config.app.env !== 'production' && { stack: error.stack }),
        },
        requestId,
        timestamp,
      });
    },
  );

  // ────────────────────────────────────────────
  // 12. Global not-found handler
  // ────────────────────────────────────────────
  app.setNotFoundHandler((_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(404).send({
      success: false,
      message: `Route ${_request.method} ${_request.url} not found`,
      data: null,
      error: {
        code: 'NOT_FOUND',
      },
      requestId: _request.id,
      timestamp: new Date().toISOString(),
    });
  });

  // ────────────────────────────────────────────
  // 13. WebSocket plugin
  // ────────────────────────────────────────────
  await app.register(websocketPlugin);

  // ────────────────────────────────────────────
  // 14. Domain routes under /api/v1
  // ────────────────────────────────────────────
  await app.register(
    async (apiRouter) => {
      await apiRouter.register(identityRoutes, { prefix: '/auth' });
      await apiRouter.register(organizationRoutes, { prefix: '/organizations' });
      await apiRouter.register(projectRoutes, { prefix: '/organizations' });
      await apiRouter.register(apiKeyRoutes, { prefix: '/projects' });
      await apiRouter.register(providerRoutes, { prefix: '/providers' });
      await apiRouter.register(gatewayRoutes, { prefix: '/gateway' });
      await apiRouter.register(auditRoutes, { prefix: '/organizations' });
      await apiRouter.register(notificationRoutes, { prefix: '/notifications' });
      await apiRouter.register(telemetryRoutes, { prefix: '' });
      await apiRouter.register(demoObservabilityRoutes, { prefix: '/demo' });
    },
    { prefix: '/api/v1' },
  );

  await app.register(openAiCompatibleRoutes, { prefix: '/v1' });

  return app;
}
