import { BasePipelineStage } from '../pipeline-stage.interface.js';
import type { ExecutionContext } from '../../shared/types.js';
import { logger } from '@orchestra/logger';
import { prisma } from '@orchestra/database';

const log = logger.child({ module: 'stage:cost' });

export class CostStage extends BasePipelineStage {
  readonly name = 'cost';
  readonly description = 'Cost estimation and budget enforcement';
  readonly order = 30;

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    const providerName = context.resolvedProvider ?? context.provider ?? 'openai';
    const modelName = context.resolvedModel ?? context.model ?? 'gpt-4o-mini';
    const usage = context.providerResponse?.usage ?? { promptTokens: context.promptMetadata?.promptTokenEstimate ?? 0, completionTokens: 0, totalTokens: context.promptMetadata?.promptTokenEstimate ?? 0 };

    const provider = context.projectId ? await prisma.provider.findFirst({ where: { name: providerName, deletedAt: null } }) : null;
    const providerModel = provider ? await prisma.providerModel.findFirst({
      where: { providerId: provider.id, modelId: modelName, deletedAt: null },
    }) : null;

    const inputRate = Number(providerModel?.inputCostPer1k ?? 0);
    const outputRate = Number(providerModel?.outputCostPer1k ?? 0);
    const weightedCost = (usage.promptTokens / 1000) * inputRate + (usage.completionTokens / 1000) * outputRate;
    const estimatedCost = Number(weightedCost.toFixed(6));

    context.metadata['costEstimated'] = true;
    context.metadata['estimatedCost'] = estimatedCost;
    context.metadata['tokenUsage'] = usage;

    if (context.projectId) {
      const existingBudget = await prisma.budget.findFirst({
        where: { projectId: context.projectId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
      });

      if (existingBudget) {
        const limit = Number(existingBudget.limitAmount);
        const spend = Number(existingBudget.currentSpend) + estimatedCost;
        context.metadata['budgetLimit'] = limit;
        context.metadata['budgetUsed'] = spend;

        if (spend > limit) {
          context.metadata['budgetExceeded'] = true;
          context.error = {
            code: 'BUDGET_EXCEEDED',
            message: `Project budget exceeded: $${spend.toFixed(2)} > $${limit.toFixed(2)}`,
            provider: providerName,
            retryable: false,
            statusCode: 429,
            timestamp: new Date().toISOString(),
            stage: 'cost',
          };
          throw new Error(context.error.message);
        }


      }
    }

    log.info({ requestId: context.requestId, estimatedCost }, 'Cost calculated');
    return context;
  }
}
