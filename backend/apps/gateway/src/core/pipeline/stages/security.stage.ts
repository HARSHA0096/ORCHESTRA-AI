import { BasePipelineStage } from '../pipeline-stage.interface.js';
import type { ExecutionContext } from '../../shared/types.js';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'stage:security' });

/**
 * Security Stage — placeholder for security checks.
 * Future: WAF, prompt injection detection, input sanitization,
 * PII detection, content policy enforcement.
 */
export class SecurityStage extends BasePipelineStage {
  readonly name = 'security';
  readonly description = 'Security checks and input sanitization';
  readonly order = 20;

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    log.debug({ requestId: context.requestId }, 'Security check (placeholder)');

    // Future: prompt injection detection
    // Future: PII detection and masking
    // Future: content policy enforcement
    // Future: rate limiting per org/project
    // Future: WAF rules

    context.metadata['securityPassed'] = true;
    context.metadata['securityChecks'] = ['placeholder'];
    return context;
  }
}
