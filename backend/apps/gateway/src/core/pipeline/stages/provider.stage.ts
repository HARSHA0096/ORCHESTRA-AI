import { BasePipelineStage } from '../pipeline-stage.interface.js';
import type { ExecutionContext } from '../../shared/types.js';
import { ProviderManager } from '../../providers/provider-manager.js';
import { middlewareEventBus, MiddlewareEventBus } from '../../events/middleware-events.js';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'stage:provider' });

/**
 * Provider Stage — executes the AI request against the resolved provider.
 * Uses the provider adapter interface for full provider independence.
 */
export class ProviderStage extends BasePipelineStage {
  readonly name = 'provider';
  readonly description = 'Executes the AI request against the resolved provider';
  readonly order = 50;

  constructor(private readonly providerManager: ProviderManager) {
    super();
  }

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    const providerName = context.resolvedProvider ?? context.provider ?? 'openai';
    const modelName = context.resolvedModel ?? context.model ?? 'gpt-4o';

    log.info(
      { requestId: context.requestId, provider: providerName, model: modelName, streaming: context.streaming },
      'Provider stage executing',
    );

    const adapter = this.providerManager.resolveProvider(providerName);
    if (!adapter) {
      throw new Error(`Provider "${providerName}" not found. Available: ${this.providerManager.getProviderNames().join(', ')}`);
    }

    // Emit provider selected event
    middlewareEventBus.emit('provider.selected', {
      ...MiddlewareEventBus.createBasePayload(context),
      provider: providerName,
      model: modelName,
      resolvedProvider: context.resolvedProvider,
      resolvedModel: context.resolvedModel,
    });

    // Emit provider started
    middlewareEventBus.emit('provider.started', {
      ...MiddlewareEventBus.createBasePayload(context),
      provider: providerName,
      model: modelName,
    });

    const providerStart = Date.now();

    try {
      if (context.streaming) {
        // For streaming, collect chunks into a full response
        let fullContent = '';
        let chunkCount = 0;

        middlewareEventBus.emit('streaming.started', {
          ...MiddlewareEventBus.createBasePayload(context),
          provider: providerName,
          model: modelName,
        });

        for await (const chunk of adapter.stream(context)) {
          fullContent += chunk.content;
          chunkCount++;
          context.onStreamChunk?.(chunk);
        }

        const latencyMs = Date.now() - providerStart;

        middlewareEventBus.emit('streaming.completed', {
          ...MiddlewareEventBus.createBasePayload(context),
          provider: providerName,
          model: modelName,
          chunkCount,
          totalDurationMs: latencyMs,
        });

        context.providerResponse = {
          content: fullContent,
          provider: providerName,
          model: modelName,
          finishReason: 'stop',
          usage: {
            promptTokens: context.promptMetadata?.promptTokenEstimate ?? 0,
            completionTokens: Math.max(1, Math.ceil(fullContent.length / 4)),
            totalTokens: (context.promptMetadata?.promptTokenEstimate ?? 0) + Math.max(1, Math.ceil(fullContent.length / 4)),
          },
          latencyMs,
          metadata: { streaming: true, chunkCount },
        };
      } else {
        const response = await adapter.generate(context);
        response.latencyMs = Date.now() - providerStart;
        context.providerResponse = response;
      }

      const latencyMs = Date.now() - providerStart;

      middlewareEventBus.emit('provider.completed', {
        ...MiddlewareEventBus.createBasePayload(context),
        provider: providerName,
        model: modelName,
        latencyMs,
        usage: context.providerResponse?.usage,
      });

      log.info(
        { requestId: context.requestId, provider: providerName, latencyMs },
        'Provider execution completed',
      );
    } catch (error) {
      log.error({ requestId: context.requestId, provider: providerName, err: error }, 'Provider execution failed');

      const providerError = error as Error & { errorCode?: string; statusCode?: number; retryable?: boolean };

      context.error = {
        code: providerError.errorCode ?? 'PROVIDER_ERROR',
        message: error instanceof Error ? error.message : 'Provider request failed',
        provider: providerName,
        retryable: providerError.retryable ?? (providerError.statusCode === undefined || providerError.statusCode >= 500 || providerError.statusCode === 429),
        statusCode: providerError.statusCode ?? 500,
        timestamp: new Date().toISOString(),
        stage: 'provider',
      };

      throw error;
    }

    return context;
  }
}
