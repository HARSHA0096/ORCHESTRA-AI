import type { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '@orchestra/database';
import { authenticateJwt } from '@orchestra/middleware';
import { BadRequestError, ForbiddenError, ErrorCode } from '@orchestra/errors';
import { TelemetryRepository } from './telemetry.repository.js';

function date(value: unknown, fallback?: Date): Date | undefined {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) throw new BadRequestError(`Invalid date: ${String(value)}`);
  return parsed;
}

function page(query: Record<string, unknown>) {
  const pageNumber = Math.max(1, Number(query.page ?? 1) || 1);
  const perPage = Math.min(100, Math.max(1, Number(query.perPage ?? 20) || 20));
  return { page: pageNumber, perPage, skip: (pageNumber - 1) * perPage, take: perPage };
}

async function resolveProject(request: FastifyRequest): Promise<string> {
  const query = request.query as Record<string, unknown>;
  const params = request.params as Record<string, string>;
  const projectId = (params.projectId ?? query.projectId ?? request.headers['x-project-id']) as string | undefined;
  if (!projectId || !request.user) throw new ForbiddenError('Project context is required', ErrorCode.PROJECT_NOT_FOUND);

  const project = await prisma.project.findFirst({
    where: { id: projectId, status: 'ACTIVE', archived: false, deletedAt: null },
    select: { id: true, organizationId: true },
  });
  if (!project) throw new ForbiddenError('Project not found or inactive', ErrorCode.PROJECT_NOT_FOUND);

  const orgMembership = await prisma.orgMembership.findFirst({ where: { userId: request.user.sub, organizationId: project.organizationId, status: 'ACTIVE', deletedAt: null } });
  const projectMembership = await prisma.projectMember.findFirst({ where: { userId: request.user.sub, projectId, deletedAt: null } });
  const orgAdmin = orgMembership && ['ORG_ADMIN', 'SUPER_ADMIN'].includes(orgMembership.role);
  if (!projectMembership && !orgAdmin) throw new ForbiddenError('Project access denied', ErrorCode.AUTH_FORBIDDEN);

  request.requestContext.organizationId = project.organizationId;
  request.requestContext.projectId = project.id;
  return project.id;
}

function windowFrom(query: Record<string, unknown>) {
  return { from: date(query.from), to: date(query.to) };
}

function envelope(request: FastifyRequest, message: string, data: unknown, meta?: unknown) {
  return { success: true, message, data, ...(meta ? { meta } : {}), requestId: request.id, timestamp: new Date().toISOString() };
}

export async function telemetryRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new TelemetryRepository();
  const scoped = [authenticateJwt, resolveProject];

  fastify.get('/metrics', { schema: { tags: ['Telemetry'], security: [{ bearerAuth: [] }] }, preHandler: scoped, handler: async (request, reply) => {
    const projectId = request.requestContext.projectId!;
    const result = await repo.metrics({ projectId, ...windowFrom(request.query as Record<string, unknown>) });
    return reply.send(envelope(request, 'Metrics retrieved', result));
  }});

  fastify.get('/history', { schema: { tags: ['Telemetry'], security: [{ bearerAuth: [] }] }, preHandler: scoped, handler: async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    const projectId = request.requestContext.projectId!;
    const pagination = page(query);
    const result = await repo.history({ projectId, ...windowFrom(query) }, { ...pagination, status: query.status as string | undefined, providerId: query.providerId as string | undefined, modelId: query.modelId as string | undefined });
    return reply.send(envelope(request, 'Request history retrieved', result.data, { total: result.total, page: pagination.page, perPage: pagination.perPage, totalPages: Math.ceil(result.total / pagination.perPage) }));
  }});

  fastify.get('/observability', { schema: { tags: ['Telemetry'], security: [{ bearerAuth: [] }] }, preHandler: scoped, handler: async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    const projectId = request.requestContext.projectId!;
    const result = await repo.latency({ projectId, ...windowFrom(query) }, query.traceId as string | undefined);
    return reply.send(envelope(request, 'Observability retrieved', result));
  }});

  fastify.get('/security', { schema: { tags: ['Telemetry'], security: [{ bearerAuth: [] }] }, preHandler: scoped, handler: async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    const projectId = request.requestContext.projectId!;
    const pagination = page(query);
    const result = await repo.events({ projectId, ...windowFrom(query) }, { ...pagination, category: query.category as string | undefined, severity: query.severity as string | undefined });
    return reply.send(envelope(request, 'Security events retrieved', result.data, { total: result.total, page: pagination.page, perPage: pagination.perPage, totalPages: Math.ceil(result.total / pagination.perPage) }));
  }});

  fastify.get('/recovery', { schema: { tags: ['Telemetry'], security: [{ bearerAuth: [] }] }, preHandler: scoped, handler: async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    const projectId = request.requestContext.projectId!;
    const pagination = page(query);
    const result = await repo.recovery({ projectId, ...windowFrom(query) }, { ...pagination, outcome: query.outcome as string | undefined });
    return reply.send(envelope(request, 'Recovery events retrieved', result.data, { total: result.total, page: pagination.page, perPage: pagination.perPage, totalPages: Math.ceil(result.total / pagination.perPage) }));
  }});

  fastify.get('/projects/:projectId/budget', { schema: { tags: ['Budgets'], security: [{ bearerAuth: [] }] }, preHandler: scoped, handler: async (request, reply) => {
    const projectId = request.requestContext.projectId!;
    const budget = await repo.getBudget(projectId);
    return reply.send(envelope(request, 'Project budget retrieved', budget));
  }});

  fastify.patch('/projects/:projectId/budget', { schema: { tags: ['Budgets'], security: [{ bearerAuth: [] }] }, preHandler: scoped, handler: async (request, reply) => {
    if (!request.user || !['ORG_ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(request.user.role)) throw new ForbiddenError('Insufficient permissions to update budget', ErrorCode.AUTH_FORBIDDEN);
    const projectId = request.requestContext.projectId!;
    const body = request.body as { limitAmount?: number; currency?: string; alertThresholds?: unknown };
    if (body.limitAmount !== undefined && (!Number.isFinite(body.limitAmount) || body.limitAmount < 0)) throw new BadRequestError('limitAmount must be a non-negative number');
    const budget = await repo.updateBudget(projectId, body);
    return reply.send(envelope(request, 'Project budget updated', budget));
  }});
}
