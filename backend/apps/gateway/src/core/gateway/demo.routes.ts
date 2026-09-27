import type { FastifyInstance } from 'fastify';
import { config } from '@orchestra/config';
import { prisma } from '@orchestra/database';

async function projectId(): Promise<string | undefined> {
  if (!(config.demo?.enabled ?? false)) return undefined;
  if (config.demo.projectId) return config.demo.projectId;
  const project = await prisma.project.findFirst({ where: { slug: 'orchestra-demo', status: 'ACTIVE', deletedAt: null }, select: { id: true }, orderBy: { createdAt: 'desc' } });
  return project?.id;
}

export async function demoObservabilityRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/status', async (_request, reply) => reply.send({ demoMode: (config.demo?.enabled ?? false), provider: (config.demo?.enabled ?? false) ? 'demo' : null }));

  fastify.get('/metrics', async (_request, reply) => {
    const id = await projectId();
    if (!id) return reply.send({ totalRequests: 0, successful: 0, failed: 0, recovered: 0, totalCost: 0, avgLatencyMs: 0, avgTokens: 0, blockedRequests: 0, activeModels: 0, recoveryRate: 0, gatewayHealth: 0, updatedAt: new Date().toISOString() });

    const [events, blockedRequests, activeModels] = await Promise.all([
      prisma.requestEvent.findMany({ where: { projectId: id, deletedAt: null }, select: { status: true, latencyMs: true, inputTokens: true, outputTokens: true, cost: true } }),
      prisma.securityEvent.count({ where: { projectId: id, deletedAt: null } }),
      prisma.providerModel.count({ where: { provider: { name: 'demo', deletedAt: null }, deletedAt: null, status: 'ACTIVE' } }),
    ]);
    const successful = events.filter((e: (typeof events)[number]) => e.status === 'SUCCESS').length;
    const failed = events.length - successful;
    const recovered = 0;
    const totalTokens = events.reduce((sum: number, e: (typeof events)[number]) => sum + (e.inputTokens ?? 0) + (e.outputTokens ?? 0), 0);
    const totalCost = events.reduce((sum: number, e: (typeof events)[number]) => sum + Number(e.cost ?? 0), 0);
    const latencySum = events.reduce((sum: number, e: (typeof events)[number]) => sum + (e.latencyMs ?? 0), 0);
    return reply.send({
      totalRequests: events.length,
      successful,
      failed,
      recovered,
      totalCost: Number(totalCost.toFixed(6)),
      avgLatencyMs: events.length ? Math.round(latencySum / events.length) : 0,
      avgTokens: events.length ? Math.round(totalTokens / events.length) : 0,
      blockedRequests,
      activeModels,
      recoveryRate: events.length ? Number(((recovered / events.length) * 100).toFixed(1)) : 0,
      gatewayHealth: events.length ? Number(((successful / events.length) * 100).toFixed(1)) : 0,
      updatedAt: new Date().toISOString(),
    });
  });

  fastify.get('/history', async (_request, reply) => {
    const id = await projectId();
    if (!id) return reply.send([]);
    const rows = await prisma.requestEvent.findMany({ where: { projectId: id, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 50 });
    const modelIds = rows.map((row: (typeof rows)[number]) => row.modelId).filter((value: string | null): value is string => Boolean(value));
    const models = modelIds.length ? await prisma.providerModel.findMany({ where: { id: { in: modelIds } }, select: { id: true, modelId: true } }) : [];
    const modelNames = new Map(models.map((model: (typeof models)[number]) => [model.id, model.modelId]));
    return reply.send(rows.map((row: (typeof rows)[number]) => ({ id: row.id, requestId: row.requestId, endpoint: row.endpoint, status: row.status, model: row.modelId ? modelNames.get(row.modelId) ?? row.modelId : 'unknown', latencyMs: row.latencyMs ?? 0, inputTokens: row.inputTokens ?? 0, outputTokens: row.outputTokens ?? 0, cost: Number(row.cost ?? 0), createdAt: row.createdAt }))); 
  });
}
