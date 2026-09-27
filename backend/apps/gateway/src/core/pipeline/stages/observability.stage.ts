import { BasePipelineStage } from '../pipeline-stage.interface.js';
import type { ExecutionContext } from '../../shared/types.js';
import { logger } from '@orchestra/logger';
import { prisma } from '@orchestra/database';

const log = logger.child({ module: 'stage:observability' });

export async function recordRequestEvent(context: ExecutionContext): Promise<string | undefined> {
  if (!context.projectId) {
    return undefined;
  }

  const provider = await prisma.provider.findFirst({ where: { name: context.resolvedProvider ?? context.provider ?? 'openai', deletedAt: null } });
  const providerModel = provider && context.resolvedModel ? await prisma.providerModel.findFirst({
    where: { providerId: provider.id, modelId: context.resolvedModel, deletedAt: null },
  }) : null;

  const usage = context.providerResponse?.usage ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  const inputRate = Number(providerModel?.inputCostPer1k ?? 0);
  const outputRate = Number(providerModel?.outputCostPer1k ?? 0);
  const estimatedCost = Number(((usage.promptTokens / 1000) * inputRate + (usage.completionTokens / 1000) * outputRate).toFixed(6));
  context.metadata['estimatedCost'] = estimatedCost;
  context.metadata['finalCost'] = estimatedCost;
  const status = context.error ? 'FAILED' : 'SUCCESS';

  const record = await prisma.requestEvent.create({
    data: {
      requestId: context.requestId,
      endpoint: context.endpoint ?? null,
      projectId: context.projectId,
      providerId: provider?.id ?? null,
      modelId: providerModel?.id ?? null,
      status,
      latencyMs: Math.max(Math.round(context.executionDurationMs || context.providerResponse?.latencyMs || 0), 0),
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
      cost: estimatedCost,
      currency: 'USD',
      traceId: context.correlationId,
      correlationId: context.correlationId,
      errorCode: context.error?.code ?? null,
      errorMessage: context.error?.message ?? null,
      errorProvider: context.error?.provider ?? null,
      errorStatusCode: context.error?.statusCode ?? null,
      errorStage: context.error?.stage ?? null,
    },
  });

  if (context.projectId && !context.error) {
    const budgetDelegate = (prisma as typeof prisma & { budget?: typeof prisma.budget }).budget;
    if (budgetDelegate) {
      const budget = await budgetDelegate.findFirst({ where: { projectId: context.projectId, deletedAt: null }, orderBy: { updatedAt: 'desc' } });
      if (budget) {
        await budgetDelegate.update({ where: { id: budget.id }, data: { currentSpend: Number(budget.currentSpend) + estimatedCost, updatedAt: new Date() } });
      }
    }
  }

  return record.id;
}

export class ObservabilityStage extends BasePipelineStage {
  readonly name = 'observability';
  readonly description = 'Metrics collection and observability';
  readonly order = 70;

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    const requestEventId = await recordRequestEvent(context);
    if (requestEventId) {
      context.metadata['observabilityRecorded'] = true;
      context.metadata['traceId'] = context.correlationId;
      context.metadata['requestEventId'] = requestEventId;
    }

    log.info({ requestId: context.requestId, provider: context.resolvedProvider, model: context.resolvedModel }, 'Observability data recorded');
    return context;
  }
}
