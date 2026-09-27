import { describe, expect, it, vi } from 'vitest';

const { requestEventCreate } = vi.hoisted(() => ({
  requestEventCreate: vi.fn().mockResolvedValue({ id: 'request-event-1' }),
}));

vi.mock('@orchestra/database', () => ({
  prisma: {
    provider: { findFirst: vi.fn().mockResolvedValue({ id: 'provider-1' }) },
    providerModel: { findFirst: vi.fn().mockResolvedValue({ id: 'model-1' }) },
    requestEvent: { create: requestEventCreate },
  },
}));

import { recordRequestEvent } from './observability.stage.js';

describe('recordRequestEvent', () => {
  it('persists request telemetry without content or credentials', async () => {
    const result = await recordRequestEvent({
      requestId: 'request-1',
      correlationId: 'correlation-1',
      executionId: 'execution-1',
      endpoint: '/v1/chat/completions',
      projectId: 'project-1',
      resolvedProvider: 'openai',
      resolvedModel: 'gpt-4o-mini',
      requestType: 'chat',
      prompt: 'do not persist this prompt',
      messages: [{ role: 'user', content: 'do not persist this message' }],
      streaming: false,
      status: 'completed',
      retryCount: 0,
      maxRetries: 0,
      currentStage: 'observability',
      stages: [],
      timestamp: new Date().toISOString(),
      startedAt: Date.now(),
      executionDurationMs: 42,
      headers: { authorization: 'Bearer secret' },
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      providerResponse: {
        content: 'do not persist this response',
        provider: 'openai',
        model: 'gpt-4o-mini',
        finishReason: 'stop',
        usage: { promptTokens: 10, completionTokens: 4, totalTokens: 14 },
        latencyMs: 40,
      },
      metadata: {},
      customMetadata: {},
    });

    expect(result).toBe('request-event-1');
    expect(requestEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        requestId: 'request-1',
        endpoint: '/v1/chat/completions',
        projectId: 'project-1',
        providerId: 'provider-1',
        modelId: 'model-1',
        status: 'SUCCESS',
        latencyMs: 42,
        inputTokens: 10,
        outputTokens: 4,
        traceId: 'correlation-1',
        correlationId: 'correlation-1',
      }),
    });

    const persistedData = requestEventCreate.mock.calls[0]![0].data as Record<string, unknown>;
    expect(JSON.stringify(persistedData)).not.toContain('do not persist');
    expect(JSON.stringify(persistedData)).not.toContain('Bearer secret');
  });
});