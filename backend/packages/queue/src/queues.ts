import type { Queue } from 'bullmq';
import { createQueue } from './queue.factory.js';

export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  PROVIDER_JOBS: 'provider-jobs',
  RECOVERY: 'recovery',
  CLEANUP: 'cleanup',
  REPORTS: 'reports',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

interface QueueRegistry {
  notifications: Queue;
  analytics: Queue;
  providerJobs: Queue;
  recovery: Queue;
  cleanup: Queue;
  reports: Queue;
}

export function initializeQueues(): QueueRegistry {
  return {
    notifications: createQueue(QUEUE_NAMES.NOTIFICATIONS),
    analytics: createQueue(QUEUE_NAMES.ANALYTICS),
    providerJobs: createQueue(QUEUE_NAMES.PROVIDER_JOBS),
    recovery: createQueue(QUEUE_NAMES.RECOVERY),
    cleanup: createQueue(QUEUE_NAMES.CLEANUP),
    reports: createQueue(QUEUE_NAMES.REPORTS),
  };
}
