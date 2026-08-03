import { BasePipelineStage } from '../pipeline-stage.interface.js';
import type { ExecutionContext } from '../../shared/types.js';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'stage:observability' });

/**
 * Observability Stage — placeholder for metrics, tracing, analytics.
 * Future: OpenTelemetry spans, Prometheus metrics, latency histograms,
 * error rate tracking, token usage analytics.
 */
export class ObservabilityStage extends BasePipelineStage {
  readonly name = 'observability';
  readonly description = 'Metrics collection and observability';
  readonly order = 70;

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    log.debug(
      {
        requestId: context.requestId,
        provider: context.resolvedProvider,
        model: context.resolvedModel,
        executionDurationMs: context.executionDurationMs,
        stageCount: context.stages.length,
        tokenUsage: context.providerResponse?.usage,
      },
      'Observability data collected (placeholder)',
    );

    // Future: emit OpenTelemetry spans
    // Future: record Prometheus metrics
    // Future: update latency histograms
    // Future: track error rates
    // Future: log token usage for billing

    context.metadata['observabilityRecorded'] = true;
    context.metadata['traceId'] = context.correlationId;
    return context;
  }
}
