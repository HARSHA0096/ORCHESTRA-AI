import type { GatewayResponse, ExecutionContext } from '../shared/types.js';

export class ResponseHandler {
  normalize(context: ExecutionContext, requestId: string, correlationId: string): GatewayResponse {
    const providerResponse = context.providerResponse;
    return {
      success: true,
      message: 'Execution completed',
      data: {
        response: providerResponse?.content ?? context.prompt ?? '',
        provider: providerResponse?.provider ?? context.provider ?? 'unknown',
        model: providerResponse?.model ?? context.model ?? 'unknown',
        finishReason: providerResponse?.finishReason ?? 'stop',
        usage: providerResponse?.usage ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        providerRequestId: providerResponse?.providerRequestId,
        toolCalls: providerResponse?.toolCalls,
        latencyMs: context.executionDurationMs,
        executionTimeMs: context.executionDurationMs,
        requestId,
        correlationId,
        metadata: context.metadata,
      },
      execution: {
        executionId: context.executionId,
        status: context.status,
        latencyMs: context.executionDurationMs,
        executionTimeMs: context.executionDurationMs,
        retryCount: context.retryCount,
        stages: context.stages,
      },
      provider: {
        name: providerResponse?.provider ?? context.provider ?? 'unknown',
        model: providerResponse?.model ?? context.model ?? 'unknown',
        resolvedProvider: context.resolvedProvider,
        resolvedModel: context.resolvedModel,
      },
      metadata: { stages: context.stages, providerResponse: providerResponse?.metadata ?? {} },
      timestamp: context.timestamp,
      requestId,
      correlationId,
      errors: [],
    };
  }
}
