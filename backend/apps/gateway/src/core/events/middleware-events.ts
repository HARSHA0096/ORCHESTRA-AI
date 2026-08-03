// ──────────────────────────────────────────────────────────────
// Orchestra AI — Middleware Event Definitions
// All events emitted by the AI Middleware Core
// ──────────────────────────────────────────────────────────────

import type { ExecutionStatus, StageResult, TokenUsage } from '../shared/types.js';

// ── Base Event Payload ─────────────────────────────────────
export interface BaseEventPayload {
  requestId: string;
  correlationId: string;
  executionId: string;
  userId?: string;
  organizationId?: string;
  projectId?: string;
  timestamp: string;
}

// ── Execution Events ───────────────────────────────────────
export interface ExecutionStartedPayload extends BaseEventPayload {
  provider?: string;
  model?: string;
  streaming: boolean;
  requestType: string;
}

export interface ExecutionCompletedPayload extends BaseEventPayload {
  provider: string;
  model: string;
  latencyMs: number;
  executionTimeMs: number;
  status: ExecutionStatus;
  usage?: TokenUsage;
  retryCount: number;
  stages: StageResult[];
}

export interface ExecutionFailedPayload extends BaseEventPayload {
  error: string;
  errorCode: string;
  provider?: string;
  model?: string;
  stage?: string;
  retryable: boolean;
  retryCount: number;
  latencyMs: number;
}

// ── Pipeline Events ────────────────────────────────────────
export interface PipelineStartedPayload extends BaseEventPayload {
  stageCount: number;
  stageNames: string[];
}

export interface PipelineCompletedPayload extends BaseEventPayload {
  totalDurationMs: number;
  stages: StageResult[];
}

// ── Stage Events ───────────────────────────────────────────
export interface StageStartedPayload extends BaseEventPayload {
  stage: string;
  stageIndex: number;
}

export interface StageCompletedPayload extends BaseEventPayload {
  stage: string;
  stageIndex: number;
  durationMs: number;
  status: 'completed' | 'skipped' | 'failed';
  metadata?: Record<string, unknown>;
}

// ── Provider Events ────────────────────────────────────────
export interface ProviderSelectedPayload extends BaseEventPayload {
  provider: string;
  model: string;
  resolvedProvider?: string;
  resolvedModel?: string;
}

export interface ProviderStartedPayload extends BaseEventPayload {
  provider: string;
  model: string;
}

export interface ProviderCompletedPayload extends BaseEventPayload {
  provider: string;
  model: string;
  latencyMs: number;
  usage?: TokenUsage;
}

// ── Streaming Events ───────────────────────────────────────
export interface StreamingStartedPayload extends BaseEventPayload {
  provider: string;
  model: string;
}

export interface StreamingCompletedPayload extends BaseEventPayload {
  provider: string;
  model: string;
  chunkCount: number;
  totalDurationMs: number;
}

// ── Request Validation ─────────────────────────────────────
export interface RequestValidatedPayload extends BaseEventPayload {
  requestType: string;
  provider?: string;
  model?: string;
}

// ── Response Events ────────────────────────────────────────
export interface ResponseGeneratedPayload extends BaseEventPayload {
  provider: string;
  model: string;
  finishReason: string;
  usage?: TokenUsage;
}

// ── Lifecycle Events ───────────────────────────────────────
export interface LifecycleChangedPayload extends BaseEventPayload {
  previousStatus: ExecutionStatus;
  newStatus: ExecutionStatus;
  stage?: string;
}

// ── Combined Event Map ─────────────────────────────────────
export interface MiddlewareEventMap {
  'execution.started': ExecutionStartedPayload;
  'execution.completed': ExecutionCompletedPayload;
  'execution.failed': ExecutionFailedPayload;
  'execution.lifecycle': LifecycleChangedPayload;
  'request.validated': RequestValidatedPayload;
  'pipeline.started': PipelineStartedPayload;
  'pipeline.completed': PipelineCompletedPayload;
  'stage.started': StageStartedPayload;
  'stage.completed': StageCompletedPayload;
  'provider.selected': ProviderSelectedPayload;
  'provider.started': ProviderStartedPayload;
  'provider.completed': ProviderCompletedPayload;
  'streaming.started': StreamingStartedPayload;
  'streaming.completed': StreamingCompletedPayload;
  'response.generated': ResponseGeneratedPayload;
}

export type MiddlewareEventName = keyof MiddlewareEventMap;

// ── Middleware Event Emitter ───────────────────────────────
import { EventEmitter } from 'node:events';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'middleware-events' });

class MiddlewareEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  emit<K extends keyof MiddlewareEventMap>(event: K, data: MiddlewareEventMap[K]): boolean {
    log.debug({ event, requestId: data.requestId, executionId: data.executionId }, `event: ${event}`);
    return this.emitter.emit(event, data);
  }

  on<K extends keyof MiddlewareEventMap>(event: K, handler: (data: MiddlewareEventMap[K]) => void): this {
    this.emitter.on(event, handler as (...args: unknown[]) => void);
    return this;
  }

  once<K extends keyof MiddlewareEventMap>(event: K, handler: (data: MiddlewareEventMap[K]) => void): this {
    this.emitter.once(event, handler as (...args: unknown[]) => void);
    return this;
  }

  off<K extends keyof MiddlewareEventMap>(event: K, handler: (data: MiddlewareEventMap[K]) => void): this {
    this.emitter.off(event, handler as (...args: unknown[]) => void);
    return this;
  }

  removeAllListeners<K extends keyof MiddlewareEventMap>(event?: K): this {
    if (event) this.emitter.removeAllListeners(event);
    else this.emitter.removeAllListeners();
    return this;
  }

  /**
   * Create a base payload with common fields for any event.
   */
  static createBasePayload(ctx: {
    requestId: string;
    correlationId: string;
    executionId: string;
    userId?: string;
    organizationId?: string;
    projectId?: string;
  }): BaseEventPayload {
    return {
      requestId: ctx.requestId,
      correlationId: ctx.correlationId,
      executionId: ctx.executionId,
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      projectId: ctx.projectId,
      timestamp: new Date().toISOString(),
    };
  }
}

export const middlewareEventBus = new MiddlewareEventBus();
export { MiddlewareEventBus };
