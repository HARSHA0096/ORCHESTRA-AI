import { describe, expect, it, vi } from 'vitest';

const recoveryCreate = vi.hoisted(() => vi.fn().mockResolvedValue({ id: 'recovery-1' }));
vi.mock('@orchestra/database', () => ({ prisma: { recoveryEvent: { create: recoveryCreate } } }));

import { RetryEngine } from './retry-engine.js';

describe('RetryEngine recovery persistence', () => {
  it('records a successful fallback with request and project context', async () => {
    const engine = new RetryEngine();
    const operation = vi.fn().mockRejectedValue(new Error('provider unavailable'));
    const fallback = vi.fn().mockResolvedValue('fallback response');

    await expect(engine.execute(operation, 0, 0, {
      run: fallback, requestId: 'request-1', projectId: 'project-1', failureReason: 'provider unavailable',
      fallbackProviderId: 'provider-2', fallbackModelId: 'model-2', attempts: 1,
    })).resolves.toBe('fallback response');

    expect(recoveryCreate).toHaveBeenCalledWith({ data: expect.objectContaining({
      requestId: 'request-1', projectId: 'project-1', failureReason: 'provider unavailable',
      fallbackProviderId: 'provider-2', fallbackModelId: 'model-2', attempts: 1, outcome: 'FALLBACK_SUCCESS',
    }) });
  });
});
