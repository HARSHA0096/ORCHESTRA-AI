import { randomUUID } from 'node:crypto';
import type { ExecutionContext } from '../shared/types.js';
import { PipelineOrchestrator } from '../pipeline/pipeline-orchestrator.js';
import { ValidationStage } from '../pipeline/stages/validation.stage.js';

export class ExecutionEngine {
  constructor(private readonly pipelineOrchestrator: PipelineOrchestrator = new PipelineOrchestrator([new ValidationStage()])) {}

  async startExecution(context: ExecutionContext): Promise<ExecutionContext> {
    const executionContext = {
      ...context,
      executionId: context.executionId ?? randomUUID(),
      status: 'running',
      currentStage: 'pipeline',
      startedAt: new Date().toISOString(),
    } as ExecutionContext & { startedAt?: string };

    return this.pipelineOrchestrator.execute(executionContext as ExecutionContext);
  }
}
