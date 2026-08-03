import { BasePipelineStage } from '../pipeline-stage.interface.js';
import type { ExecutionContext } from '../../shared/types.js';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'stage:routing' });

/**
 * Routing Stage — resolves the provider and model to use.
 * Currently: pass-through (use requested provider/model).
 * Future: smart routing based on cost, latency, availability,
 * load balancing, failover, A/B testing.
 */
export class RoutingStage extends BasePipelineStage {
  readonly name = 'routing';
  readonly description = 'Model routing and provider selection';
  readonly order = 40;

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    log.debug({ requestId: context.requestId, provider: context.provider, model: context.model }, 'Routing (placeholder)');

    // Default: pass-through — use whatever the client specified
    context.resolvedProvider = context.provider ?? 'openai';
    context.resolvedModel = context.model ?? 'gpt-4o';

    // Future: intelligent routing
    // Future: load balancing
    // Future: failover chains
    // Future: A/B testing
    // Future: cost-optimized routing

    context.metadata['routingStrategy'] = 'pass-through';
    context.metadata['routedProvider'] = context.resolvedProvider;
    context.metadata['routedModel'] = context.resolvedModel;
    return context;
  }
}
