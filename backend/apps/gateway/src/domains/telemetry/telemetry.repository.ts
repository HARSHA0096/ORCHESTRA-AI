import { prisma } from '@orchestra/database';

export interface TelemetryWindow {
  projectId: string;
  from?: Date;
  to?: Date;
}

function eventWhere(window: TelemetryWindow) {
  return {
    projectId: window.projectId,
    deletedAt: null,
    ...(window.from || window.to ? { createdAt: { ...(window.from ? { gte: window.from } : {}), ...(window.to ? { lte: window.to } : {}) } } : {}),
  };
}

export class TelemetryRepository {
  async metrics(window: TelemetryWindow) {
    const where = eventWhere(window);
    const [count, aggregate, failed] = await Promise.all([
      prisma.requestEvent.count({ where }),
      prisma.requestEvent.aggregate({ where, _avg: { latencyMs: true }, _sum: { cost: true, inputTokens: true, outputTokens: true } }),
      prisma.requestEvent.count({ where: { ...where, status: { not: 'SUCCESS' } } }),
    ]);
    const byProvider = await prisma.requestEvent.groupBy({
      by: ['providerId'],
      where,
      _count: { _all: true },
      _sum: { cost: true, inputTokens: true, outputTokens: true },
    });
    return {
      requestCount: count,
      errorCount: failed,
      errorRate: count === 0 ? 0 : Number((failed / count).toFixed(6)),
      averageLatencyMs: aggregate._avg.latencyMs ?? 0,
      totalCost: Number(aggregate._sum.cost ?? 0),
      inputTokens: aggregate._sum.inputTokens ?? 0,
      outputTokens: aggregate._sum.outputTokens ?? 0,
      byProvider,
    };
  }

  async history(window: TelemetryWindow, options: { skip: number; take: number; status?: string; providerId?: string; modelId?: string }) {
    const where = {
      ...eventWhere(window),
      ...(options.status ? { status: options.status as never } : {}),
      ...(options.providerId ? { providerId: options.providerId } : {}),
      ...(options.modelId ? { modelId: options.modelId } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.requestEvent.findMany({ where, orderBy: { createdAt: 'desc' }, skip: options.skip, take: options.take }),
      prisma.requestEvent.count({ where }),
    ]);
    return { data, total };
  }

  async events(window: TelemetryWindow, options: { skip: number; take: number; category?: string; severity?: string }) {
    const where = {
      ...eventWhere(window),
      ...(options.category ? { category: options.category as never } : {}),
      ...(options.severity ? { severity: options.severity as never } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.securityEvent.findMany({ where, orderBy: { createdAt: 'desc' }, skip: options.skip, take: options.take }),
      prisma.securityEvent.count({ where }),
    ]);
    return { data, total };
  }

  async recovery(window: TelemetryWindow, options: { skip: number; take: number; outcome?: string }) {
    const where = {
      ...eventWhere(window),
      ...(options.outcome ? { outcome: options.outcome as never } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.recoveryEvent.findMany({ where, orderBy: { createdAt: 'desc' }, skip: options.skip, take: options.take }),
      prisma.recoveryEvent.count({ where }),
    ]);
    return { data, total };
  }

  async latency(window: TelemetryWindow, traceId?: string) {
    const events = await prisma.requestEvent.findMany({
      where: { ...eventWhere(window), ...(traceId ? { traceId } : {}) },
      select: { requestId: true, endpoint: true, latencyMs: true, status: true, providerId: true, modelId: true, traceId: true, correlationId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: traceId ? 1000 : 10000,
    });
    const latencies: number[] = events
      .map((e: (typeof events)[number]) => e.latencyMs)
      .filter((v: number | null): v is number => typeof v === 'number')
      .sort((a: number, b: number) => a - b);
    const percentile = (p: number) => {
      if (latencies.length === 0) return 0;
      const index = Math.min(latencies.length - 1, Math.ceil((p / 100) * latencies.length) - 1);
      return latencies[index] ?? 0;
    };
    return { p50: percentile(50), p95: percentile(95), p99: percentile(99), sampleSize: latencies.length, traces: events };
  }

  async getBudget(projectId: string) {
    return prisma.budget.findFirst({ where: { projectId, deletedAt: null }, orderBy: { updatedAt: 'desc' } });
  }

  async updateBudget(projectId: string, data: { period?: never; limitAmount?: number; currency?: string; alertThresholds?: unknown }) {
    const existing = await this.getBudget(projectId);
    if (!existing) {
      return prisma.budget.create({
        data: {
          projectId,
          period: 'MONTHLY',
          limitAmount: data.limitAmount ?? 0,
          currency: data.currency ?? 'USD',
          alertThresholds: data.alertThresholds as object | undefined,
        },
      });
    }
    return prisma.budget.update({
      where: { id: existing.id },
      data: {
        ...(data.limitAmount !== undefined ? { limitAmount: data.limitAmount } : {}),
        ...(data.currency !== undefined ? { currency: data.currency } : {}),
        ...(data.alertThresholds !== undefined ? { alertThresholds: data.alertThresholds as object } : {}),
      },
    });
  }
}
