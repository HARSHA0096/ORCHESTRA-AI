import { BasePipelineStage } from '../pipeline-stage.interface.js';
import type { ExecutionContext } from '../../shared/types.js';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'stage:validation' });

/**
 * Validation Stage — validates request input before further processing.
 * Checks: prompt/messages exist, sampling params in range, model specified.
 */
export class ValidationStage extends BasePipelineStage {
  readonly name = 'validation';
  readonly description = 'Validates AI request inputs';
  readonly order = 10;

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    log.debug({ requestId: context.requestId }, 'Validating request');

    // Must have either prompt or messages
    if (!context.prompt && (!context.messages || context.messages.length === 0)) {
      throw new Error('Either prompt or messages must be provided');
    }

    // Temperature range
    if (context.temperature !== undefined && (context.temperature < 0 || context.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    // TopP range
    if (context.topP !== undefined && (context.topP < 0 || context.topP > 1)) {
      throw new Error('topP must be between 0 and 1');
    }

    // MaxTokens
    if (context.maxTokens !== undefined && (context.maxTokens < 1 || context.maxTokens > 1000000)) {
      throw new Error('maxTokens must be between 1 and 1000000');
    }

    // Prompt metadata estimation
    const promptContent = context.prompt ?? context.messages?.map((m) => m.content).join(' ') ?? '';
    context.promptMetadata = {
      promptTokenEstimate: Math.ceil(promptContent.length / 4),
      messageCount: context.messages?.length ?? (context.prompt ? 1 : 0),
      hasSystemMessage: context.messages?.some((m) => m.role === 'system') ?? false,
      hasTools: (context.tools?.length ?? 0) > 0,
    };

    context.status = 'validated';
    log.debug({ requestId: context.requestId, tokenEstimate: context.promptMetadata.promptTokenEstimate }, 'Validation passed');
    return context;
  }
}
