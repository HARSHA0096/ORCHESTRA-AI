// ──────────────────────────────────────────────────────────────
// Orchestra AI — Pipeline Orchestrator
// Configurable pipeline engine that executes stages sequentially.
// Supports dynamic enable/disable, stage guards, event publishing,
// and per-stage timing.
// ──────────────────────────────────────────────────────────────

import { logger } from '@orchestra/logger';
import type { PipelineStage } from './pipeline-stage.interface.js';
import type { ExecutionContext, StageResult } from '../shared/types.js';
import { middlewareEventBus, MiddlewareEventBus } from '../events/middleware-events.js';

const log = logger.child({ module: 'pipeline' });

export class PipelineOrchestrator {
  private readonly stages: PipelineStage[];

  constructor(stages: PipelineStage[]) {
    // Sort stages by order priority
    this.stages = [...stages].sort((a, b) => a.order - b.order);
    log.info({ stageCount: this.stages.length, stages: this.stages.map((s) => s.name) }, 'Pipeline initialized');
  }

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    let current = { ...context, stages: [] as StageResult[] };
    const pipelineStart = Date.now();

    const enabledStages = this.stages.filter((s) => s.enabled);

    // Publish pipeline started
    middlewareEventBus.emit('pipeline.started', {
      ...MiddlewareEventBus.createBasePayload(current),
      stageCount: enabledStages.length,
      stageNames: enabledStages.map((s) => s.name),
    });

    log.info(
      { requestId: current.requestId, stageCount: enabledStages.length },
      'Pipeline execution started',
    );

    for (let i = 0; i < enabledStages.length; i++) {
      const stage = enabledStages[i]!;

      // Check shouldExecute guard
      if (stage.shouldExecute && !stage.shouldExecute(current)) {
        const skippedResult: StageResult = {
          name: stage.name,
          status: 'skipped',
          durationMs: 0,
          metadata: { reason: 'shouldExecute returned false' },
        };
        current.stages.push(skippedResult);

        middlewareEventBus.emit('stage.completed', {
          ...MiddlewareEventBus.createBasePayload(current),
          stage: stage.name,
          stageIndex: i,
          durationMs: 0,
          status: 'skipped',
        });

        log.debug({ requestId: current.requestId, stage: stage.name }, 'Stage skipped');
        continue;
      }

      current.currentStage = stage.name;

      middlewareEventBus.emit('stage.started', {
        ...MiddlewareEventBus.createBasePayload(current),
        stage: stage.name,
        stageIndex: i,
      });

      const stageStart = Date.now();

      try {
        current = await stage.execute(current);
        const durationMs = Date.now() - stageStart;

        const stageResult: StageResult = {
          name: stage.name,
          status: 'completed',
          durationMs,
        };
        current.stages.push(stageResult);

        middlewareEventBus.emit('stage.completed', {
          ...MiddlewareEventBus.createBasePayload(current),
          stage: stage.name,
          stageIndex: i,
          durationMs,
          status: 'completed',
        });

        log.debug(
          { requestId: current.requestId, stage: stage.name, durationMs },
          'Stage completed',
        );
      } catch (error) {
        const durationMs = Date.now() - stageStart;
        const errMsg = error instanceof Error ? error.message : String(error);

        const failedResult: StageResult = {
          name: stage.name,
          status: 'failed',
          durationMs,
          error: errMsg,
        };
        current.stages.push(failedResult);

        middlewareEventBus.emit('stage.completed', {
          ...MiddlewareEventBus.createBasePayload(current),
          stage: stage.name,
          stageIndex: i,
          durationMs,
          status: 'failed',
          metadata: { error: errMsg },
        });

        log.error(
          { requestId: current.requestId, stage: stage.name, durationMs, err: error },
          'Stage failed',
        );

        // Propagate the error — execution engine handles retry/failure
        throw error;
      }
    }

    const totalDuration = Date.now() - pipelineStart;
    current.executionDurationMs = totalDuration;
    current.currentStage = 'completed';

    middlewareEventBus.emit('pipeline.completed', {
      ...MiddlewareEventBus.createBasePayload(current),
      totalDurationMs: totalDuration,
      stages: current.stages,
    });

    log.info(
      { requestId: current.requestId, totalDurationMs: totalDuration, stagesRun: current.stages.length },
      'Pipeline execution completed',
    );

    return current;
  }

  // ── Configuration ─────────────────────────────
  getStages(): PipelineStage[] {
    return [...this.stages];
  }

  getStageNames(): string[] {
    return this.stages.map((s) => s.name);
  }

  enableStage(name: string): boolean {
    const stage = this.stages.find((s) => s.name === name);
    if (stage) { stage.enabled = true; return true; }
    return false;
  }

  disableStage(name: string): boolean {
    const stage = this.stages.find((s) => s.name === name);
    if (stage) { stage.enabled = false; return true; }
    return false;
  }

  isStageEnabled(name: string): boolean {
    return this.stages.find((s) => s.name === name)?.enabled ?? false;
  }
}
