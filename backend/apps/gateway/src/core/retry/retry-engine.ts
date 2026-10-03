import { prisma } from '@orchestra/database';

export class RetryEngine {
  async execute<T>(
    operation: () => Promise<T>,
    retries = 2,
    delayMs = 100,
    fallback?: {
      run: () => Promise<T>;
      requestId?: string;
      projectId?: string;
      failureReason?: string;
      fallbackProviderId?: string;
      fallbackModelId?: string;
      attempts?: number;
    },
  ): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await operation();
      } catch (error) {
        const retryable = (error as { retryable?: boolean } | null)?.retryable;
        if (retryable !== true || attempt >= retries) {
          if (fallback) {
            const started = Date.now();
            try {
              const result = await fallback.run();
              if (fallback.requestId && fallback.projectId) {
                await prisma.recoveryEvent.create({
                  data: {
                    requestId: fallback.requestId,
                    projectId: fallback.projectId,
                    failureReason: fallback.failureReason ?? (error instanceof Error ? error.message : String(error)),
                    fallbackProviderId: fallback.fallbackProviderId ?? undefined,
                    fallbackModelId: fallback.fallbackModelId ?? undefined,
                    attempts: fallback.attempts ?? 1,
                    durationMs: Date.now() - started,
                    outcome: 'FALLBACK_SUCCESS',
                  },
                });
              }
              return result;
            } catch (fallbackError) {
              if (fallback.requestId && fallback.projectId) {
                await prisma.recoveryEvent.create({
                  data: {
                    requestId: fallback.requestId,
                    projectId: fallback.projectId,
                    failureReason: fallback.failureReason ?? (error instanceof Error ? error.message : String(error)),
                    fallbackProviderId: fallback.fallbackProviderId ?? undefined,
                    fallbackModelId: fallback.fallbackModelId ?? undefined,
                    attempts: fallback.attempts ?? 1,
                    durationMs: Date.now() - started,
                    outcome: 'FALLBACK_FAILED',
                  },
                });
              }
              throw fallbackError;
            }
          }
          throw error;
        }
        attempt += 1;
        const exponentialDelay = delayMs * (2 ** (attempt - 1));
        const jitter = Math.floor(Math.random() * Math.max(1, Math.floor(exponentialDelay * 0.25)));
        await new Promise((resolve) => setTimeout(resolve, exponentialDelay + jitter));
      }
    }
  }
}
