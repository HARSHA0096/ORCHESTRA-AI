import { randomUUID } from 'node:crypto';
import type { EventBus } from '@orchestra/events';
import type { GatewayRequestInput, GatewayResponse, ExecutionContext } from '../shared/types.js';
import { PipelineOrchestrator } from '../pipeline/pipeline-orchestrator.js';
import { ValidationStage } from '../pipeline/stages/validation.stage.js';
import { SecurityStage } from '../pipeline/stages/security.stage.js';
import { CostStage } from '../pipeline/stages/cost.stage.js';
import { RoutingStage } from '../pipeline/stages/routing.stage.js';
import { ProviderStage } from '../pipeline/stages/provider.stage.js';
import { ResponseStage } from '../pipeline/stages/response.stage.js';
import { ObservabilityStage, recordRequestEvent } from '../pipeline/stages/observability.stage.js';
import { ProviderManager } from '../providers/provider-manager.js';
import { ProviderRegistry } from '../providers/provider-registry.js';
import { ExecutionEngine } from '../execution/execution-engine.js';
import { ResponseHandler } from '../response/response-handler.js';
import { RetryEngine } from '../retry/retry-engine.js';
import { StreamingEngine } from '../streaming/streaming-engine.js';

export interface GatewayServiceOptions {
  providerManager?: ProviderManager;
  eventBus?: Pick<EventBus, 'emit'>;
  pipelineOrchestrator?: PipelineOrchestrator;
}

export class GatewayService {
  private readonly eventBus: Pick<EventBus, 'emit'>;
  private readonly pipelineOrchestrator: PipelineOrchestrator;
  private readonly providerManagerForGateway: ProviderManager;
  private readonly executionEngine: ExecutionEngine;
  private readonly responseHandler: ResponseHandler;

  constructor(options: GatewayServiceOptions = {}) {
    const manager = options.providerManager ?? new ProviderManager();
    this.providerManagerForGateway = manager;
    const registry = new ProviderRegistry(manager);
    registry.registerDefaults();

    this.eventBus = options.eventBus ?? { emit: () => true };
    this.pipelineOrchestrator = options.pipelineOrchestrator ?? new PipelineOrchestrator([
      new ValidationStage(),
      new SecurityStage(),
      new CostStage(),
      new RoutingStage(),
      new ProviderStage(manager),
      new ResponseStage(),
      new ObservabilityStage(),
    ]);
    this.executionEngine = new ExecutionEngine(this.pipelineOrchestrator);
    this.responseHandler = new ResponseHandler();
  }

  getProviderManager(): ProviderManager {
    return this.providerManagerForGateway;
  }

  async execute(input: GatewayRequestInput): Promise<GatewayResponse> {
    const requestId = randomUUID();
    const correlationId = randomUUID();
    const startedAt = Date.now();

    const context: ExecutionContext = {
      requestId,
      correlationId,
      executionId: randomUUID(),
      userId: input.userId,
      organizationId: input.organizationId,
      projectId: input.projectId,
      endpoint: input.endpoint,
      apiKey: input.apiKey,
      provider: input.provider,
      model: input.model,
      temperature: input.temperature,
      topP: input.topP,
      topK: input.topK,
      maxTokens: input.maxTokens,
      stop: input.stop,
      frequencyPenalty: input.frequencyPenalty,
      presencePenalty: input.presencePenalty,
      responseFormat: input.responseFormat,
      tools: input.tools,
      toolChoice: input.toolChoice,
      streaming: input.streaming ?? false,
      retryCount: 0,
      maxRetries: 3,
      requestType: input.requestType ?? 'chat',
      prompt: input.prompt,
      messages: input.messages,
      metadata: input.metadata ?? {},
      customMetadata: {},
      onStreamChunk: input.onStreamChunk,
      headers: {},
      ipAddress: '127.0.0.1',
      userAgent: 'orchestra-test',
      timestamp: new Date().toISOString(),
      startedAt: Date.now(),
      status: 'received',
      executionDurationMs: 0,
      currentStage: 'received',
      stages: [],
    };

    this.eventBus.emit('execution.started' as never, {
      requestId,
      correlationId,
      provider: input.provider,
    } as never);

    const retryEngine = new RetryEngine();
    const streamingEngine = new StreamingEngine();
    await streamingEngine.prepareStream(context);

    let executedContext: ExecutionContext;
    try {
      executedContext = await retryEngine.execute(async () => this.executionEngine.startExecution(context));
    } catch (error) {
      context.error ??= {
        code: 'GATEWAY_ERROR',
        message: error instanceof Error ? error.message : String(error),
        retryable: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        stage: context.currentStage,
      };
      context.executionDurationMs = Date.now() - startedAt;
      await recordRequestEvent(context);
      throw error;
    }
    const latencyMs = Date.now() - startedAt;
    const response = this.responseHandler.normalize(
      {
        ...executedContext,
        executionDurationMs: latencyMs,
      },
      requestId,
      correlationId,
    );

    return response;
  }
}
