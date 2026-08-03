import { PrismaClient } from '@prisma/client';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'database' });

class Database {
  private client: any;
  private connected = false;

  constructor() {
    this.client = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.client.$on('error', (event: { target?: string; message: string }) => {
      log.error({ target: event.target }, event.message);
    });

    this.client.$on('warn', (event: { target?: string; message: string }) => {
      log.warn({ target: event.target }, event.message);
    });

    // Soft-delete middleware: auto-filter deleted records on find operations
    this.client.$use(async (params: any, next: (params: any) => Promise<unknown>) => {
      const modelsWithSoftDelete = [
        'User', 'Organization', 'OrgMembership', 'Project', 'ProjectMember',
        'ApiKey', 'Provider', 'ProviderModel', 'Notification', 'Configuration',
      ];

      if (params.model && modelsWithSoftDelete.includes(params.model)) {
        if (params.action === 'findMany' || params.action === 'findFirst') {
          if (!params.args) {
            params.args = {};
          }
          if (!params.args.where) {
            params.args.where = {};
          }
          if (params.args.where['deletedAt'] === undefined) {
            params.args.where['deletedAt'] = null;
          }
        }

        if (params.action === 'findUnique' || params.action === 'findUniqueOrThrow') {
          params.action = 'findFirst';
          if (!params.args) {
            params.args = {};
          }
          if (!params.args.where) {
            params.args.where = {};
          }
          if (params.args.where['deletedAt'] === undefined) {
            params.args.where['deletedAt'] = null;
          }
        }
      }

      return next(params);
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    await this.client.$connect();
    this.connected = true;
    log.info('Database connected');
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    await this.client.$disconnect();
    this.connected = false;
    log.info('Database disconnected');
  }

  async healthCheck(): Promise<void> {
    await this.client.$queryRaw`SELECT 1`;
  }

  getClient(): any {
    return this.client;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const database = new Database();
export const prisma = database.getClient();
