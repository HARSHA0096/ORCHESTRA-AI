import { describe, expect, it, vi } from 'vitest';
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
      apiKey: 'key-1',
      requestType: 'chat',
      metadata: { source: 'tests' },
    });

    expect(result.success).toBe(true);
    expect(result.data.provider).toBe('test-provider');
    expect(result.data.model).toBe('test-model');
    expect(result.requestId).toBeTruthy();
    expect(result.correlationId).toBeTruthy();
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
    expect(result.currentStage).toBe('validation');
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
