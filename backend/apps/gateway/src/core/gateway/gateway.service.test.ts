import { describe, expect, it, vi } from 'vitest';

const requestEventCreate = vi.hoisted(() => vi.fn().mockResolvedValue({ id: 'evt-1' }));

vi.mock('@orchestra/database', () => ({
  prisma: {
    securityEvent: { create: vi.fn() },
    provider: { findFirst: vi.fn().mockResolvedValue({ id: 'provider-1', name: 'test-provider' }) },
    providerModel: { findFirst: vi.fn().mockResolvedValue({ id: 'model-1', modelId: 'test-model', inputCostPer1k: 0, outputCostPer1k: 0 }) },
    budget: { findFirst: vi.fn().mockResolvedValue(null), update: vi.fn() },
    requestEvent: { create: requestEventCreate },
  },
}));

import { GatewayService } from './gateway.service.js';
import { PipelineOrchestrator } from '../pipeline/pipeline-orchestrator.js';
import { ValidationStage } from '../pipeline/stages/validation.stage.js';
import { ProviderManager } from '../providers/provider-manager.js';

describe('GatewayService', () => {
  it('executes an AI request and returns a standard response', async () => {
    const providerManager = new ProviderManager();
    providerManager.registerProvider({
      name: 'test-provider',
      displayName: 'Test Provider',
      type: 'CUSTOM',
      capabilities: {
        streaming: false,
        vision: false,
        functions: false,
        tools: false,
        json: true,
      },
      generate: async () => ({
        content: 'test response',
        provider: 'test-provider',
        model: 'test-model',
        finishReason: 'stop',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        latencyMs: 0,
      }),
      stream: async function* () {},
      health: async () => true,
      models: async () => [],
      getCapabilities: () => ({
        streaming: false,
        vision: false,
        functions: false,
        tools: false,
        json: true,
        embeddings: false,
        images: false,
        audio: false,
      }),
      supportsStreaming: () => false,
      supportsVision: () => false,
      supportsFunctions: () => false,
      supportsTools: () => false,
      supportsJSON: () => true,
      supportsEmbeddings: () => false,
    });

    const service = new GatewayService({
      providerManager,
      eventBus: { emit: vi.fn() } as never,
    });

    const result = await service.execute({
      prompt: 'Summarize this request',
      provider: 'test-provider',
      model: 'test-model',
      userId: 'user-1',
      organizationId: 'org-1',
      projectId: 'project-1',
      requestType: 'chat',
      metadata: { source: 'tests' },
    });

    expect(result.success).toBe(true);
    expect(result.data.provider).toBe('test-provider');
    expect(result.data.model).toBe('test-model');
    expect(result.requestId).toBeTruthy();
    expect(result.correlationId).toBeTruthy();

    expect(requestEventCreate).toHaveBeenCalledTimes(1);
    const event = requestEventCreate.mock.calls[0]?.[0]?.data;
    expect(event).toMatchObject({
      requestId: result.requestId,
      endpoint: null,
      projectId: 'project-1',
      providerId: 'provider-1',
      modelId: 'model-1',
      status: 'SUCCESS',
      inputTokens: 1,
      outputTokens: 1,
      traceId: result.correlationId,
      correlationId: result.correlationId,
    });
    expect(event).not.toHaveProperty('prompt');
    expect(event).not.toHaveProperty('messages');
    expect(event).not.toHaveProperty('apiKey');
  });
});

describe('PipelineOrchestrator', () => {
  it('runs configured stages and updates context state', async () => {
    const orchestrator = new PipelineOrchestrator([new ValidationStage()]);
    const context = {
      requestId: 'req-1',
      correlationId: 'corr-1',
      requestType: 'chat',
      prompt: 'Hello',
      metadata: {},
      status: 'received',
      currentStage: 'received',
      startedAt: new Date().toISOString(),
      stages: [],
    } as any;

    const result = await orchestrator.execute(context);

    expect(result.status).toBe('validated');
    expect(result.stages).toHaveLength(1);
    expect(result.currentStage).toBe('completed');
  });
});

describe('ProviderManager', () => {
  it('registers and resolves providers by name', () => {
    const manager = new ProviderManager();
    manager.registerProvider({
      name: 'openrouter',
      displayName: 'OpenRouter',
      type: 'CUSTOM',
      capabilities: {
        streaming: true,
        vision: false,
        functions: false,
        tools: false,
        json: true,
      },
    });

    const provider = manager.resolveProvider('openrouter');

    expect(provider?.name).toBe('openrouter');
    expect(manager.listProviders()).toHaveLength(1);
  });
});


describe('Provider health monitoring', () => {
  it('reports every registered provider without throwing on an unhealthy adapter', async () => {
    const manager = new ProviderManager();
    const healthy = {
      name: 'healthy', displayName: 'Healthy', type: 'TEST',
      generate: async () => { throw new Error('unused'); }, stream: async function* () {},
      health: async () => true, models: async () => [],
      getCapabilities: () => ({ streaming: false, vision: false, functions: false, tools: false, json: false, embeddings: false, images: false, audio: false }),
      supportsStreaming: () => false, supportsVision: () => false, supportsFunctions: () => false, supportsTools: () => false, supportsJSON: () => false, supportsEmbeddings: () => false,
    };
    const unhealthy = { ...healthy, name: 'unhealthy', health: async () => false };
    manager.registerProvider(healthy as never);
    manager.registerProvider(unhealthy as never);
    await expect(manager.healthCheckAll()).resolves.toEqual(new Map([['healthy', true], ['unhealthy', false]]));
  });
});
