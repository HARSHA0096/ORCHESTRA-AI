import { Queue } from 'bullmq';
import type { QueueOptions, JobsOptions } from 'bullmq';
import { config } from '@orchestra/config';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'queue' });

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

export function createQueue<T>(name: string, options?: Partial<QueueOptions>): Queue<T> {
  const queue = new Queue<T>(name, {
    prefix: config.queue.prefix,
    connection: {
      host: new URL(config.redis.url).hostname,
      port: parseInt(new URL(config.redis.url).port || '6379', 10),
    },
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
    ...options,
  });

  queue.on('error', (error) => {
    log.error({ queue: name, err: error }, 'Queue error');
  });

  log.debug({ queue: name }, 'Queue created');

  return queue;
}
