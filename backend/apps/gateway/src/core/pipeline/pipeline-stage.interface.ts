// ──────────────────────────────────────────────────────────────
// Orchestra AI — Pipeline Stage Interface
// Every pipeline stage must implement this contract.
// Stages are dynamically configurable — enable/disable without
// changing pipeline code.
// ──────────────────────────────────────────────────────────────

import type { ExecutionContext } from '../shared/types.js';

/**
 * Interface that every pipeline stage MUST implement.
 * Stages receive an execution context, process it, and return
 * the (potentially modified) context.
 */
export interface PipelineStage {
  /** Unique stage identifier */
  readonly name: string;

  /** Human-readable stage description */
  readonly description: string;

  /** Whether this stage is currently enabled */
  enabled: boolean;

  /** Execution order priority (lower = earlier) */
  readonly order: number;

  /**
   * Execute this pipeline stage.
   * @param context - The current execution context
   * @returns Updated execution context
   * @throws {Error} if stage processing fails
   */
  execute(context: ExecutionContext): Promise<ExecutionContext>;

  /**
   * Optional: Validate whether this stage should run for the given context.
   * Return false to skip this stage.
   */
  shouldExecute?(context: ExecutionContext): boolean;
}

/**
 * Abstract base for pipeline stages.
 * Provides default implementations for common patterns.
 */
export abstract class BasePipelineStage implements PipelineStage {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly order: number;
  enabled = true;

  abstract execute(context: ExecutionContext): Promise<ExecutionContext>;

  shouldExecute(_context: ExecutionContext): boolean {
    return this.enabled;
  }
}
