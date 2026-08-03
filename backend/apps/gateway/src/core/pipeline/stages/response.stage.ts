import { BasePipelineStage } from '../pipeline-stage.interface.js';
import type { ExecutionContext } from '../../shared/types.js';
import { middlewareEventBus, MiddlewareEventBus } from '../../events/middleware-events.js';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'stage:response' });

/**
 * Response Stage — normalizes provider response into the standard format.
 * Future: content filtering, output validation, response caching.
 */
export class ResponseStage extends BasePipelineStage {
  readonly name = 'response';
  readonly description = 'Response normalization and post-processing';
  readonly order = 60;

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    log.debug({ requestId: context.requestId }, 'Processing response');

    if (!context.providerResponse) {
      log.warn({ requestId: context.requestId }, 'No provider response — skipping response stage');
      return context;
    }

    // Emit response generated event
    middlewareEventBus.emit('response.generated', {
      ...MiddlewareEventBus.createBasePayload(context),
      provider: context.providerResponse.provider,
      model: context.providerResponse.model,
      finishReason: context.providerResponse.finishReason,
      usage: context.providerResponse.usage,
    });

    // Future: content filtering
    // Future: output validation (JSON mode check)
    // Future: response caching
    // Future: PII detection in output
    // Future: content moderation

    context.metadata['responseProcessed'] = true;
    return context;
  }
}
