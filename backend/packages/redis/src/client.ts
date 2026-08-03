import Redis from 'ioredis';
import { config } from '@orchestra/config';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'redis' });

class RedisClient {
  private client: any = null;
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected && this.client) return;

    this.client = new (Redis as any)(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 200, 5000);
        log.warn({ attempt: times, delayMs: delay }, 'Redis reconnecting...');
        return delay;
      },
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.connected = true;
      log.info('Redis connected');
    });

    this.client.on('error', (error: Error) => {
      log.error({ err: error }, 'Redis error');
    });

    this.client.on('close', () => {
      this.connected = false;
      log.warn('Redis connection closed');
    });

    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;
    await this.client.quit();
    this.connected = false;
    log.info('Redis disconnected');
  }

  async healthCheck(): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    const result = await this.client.ping();
    if (result !== 'PONG') {
      throw new Error(`Redis health check failed: ${result}`);
    }
  }

  getClient(): any {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return this.client;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const redis = new RedisClient();
