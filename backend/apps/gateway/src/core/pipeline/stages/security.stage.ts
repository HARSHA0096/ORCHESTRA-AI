import { BasePipelineStage } from '../pipeline-stage.interface.js';
import type { ExecutionContext } from '../../shared/types.js';
import { logger } from '@orchestra/logger';
import { prisma } from '@orchestra/database';

const log = logger.child({ module: 'stage:security' });

export class SecurityStage extends BasePipelineStage {
  readonly name = 'security';
  readonly description = 'Security checks and input sanitization';
  readonly order = 20;

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    const text = context.prompt ?? context.messages?.map((msg) => msg.content).join('\n') ?? '';
    const checks: string[] = [];
    const injectionPatterns = [/ignore previous instructions/i, /developer mode/i, /system prompt/i, /jailbreak/i, /do not follow/i];
    const piiPatterns = [/\b\d{3}-\d{2}-\d{4}\b/, /\b(?:\d{1,3}\.){3}\d{1,3}\b/, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/];

    if (text.length > 200_000) {
      checks.push('input-too-large');
    }
    if (injectionPatterns.some((pattern) => pattern.test(text))) {
      checks.push('prompt-injection');
    }
    if (piiPatterns.some((pattern) => pattern.test(text))) {
      checks.push('pii-detected');
    }

    const severity = checks.length === 0 ? 'low' : checks.includes('prompt-injection') || checks.includes('input-too-large') ? 'high' : 'medium';
    context.metadata['securityPassed'] = checks.length === 0;
    context.metadata['securityChecks'] = checks.length > 0 ? checks : ['passed'];

    if (context.projectId && checks.length > 0) {
      await prisma.securityEvent.create({
        data: {
          projectId: context.projectId,
          requestId: context.requestId || null,
          category: checks.includes('prompt-injection') ? 'PROMPT_INJECTION' : checks.includes('pii-detected') ? 'PII_DETECTION' : 'CONTENT_FILTER',
          severity: severity === 'high' ? 'HIGH' : severity === 'medium' ? 'MEDIUM' : 'LOW',
          source: 'gateway.security.stage',
          action: 'block',
          policyId: 'default-security-policy',
        },
      });

      if (severity === 'high') {
        throw new Error('Request blocked by security policy checks.');
      }
    }

    log.info({ requestId: context.requestId, checks }, 'Security checks executed');
    return context;
  }
}
