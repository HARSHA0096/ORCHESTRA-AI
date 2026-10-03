import { PrismaClient } from '@prisma/client';
import { logger } from '@orchestra/logger';

const log = logger.child({ module: 'database' });

/**
 * Prisma 6 no longer supports the legacy Prisma middleware API. Soft-delete
 * filtering is implemented with a Prisma query extension instead, preserving
 * the previous behavior for read operations without relying on removed APIs.
 */
class Database {
  private client: any;
  private connected = false;

  constructor() {
    const baseClient = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    baseClient.$on('error', (event: { target?: string; message: string }) => {
      log.error({ target: event.target }, event.message);
    });

    baseClient.$on('warn', (event: { target?: string; message: string }) => {
      log.warn({ target: event.target }, event.message);
    });

    const modelsWithSoftDelete = new Set([
      'User', 'Organization', 'OrgMembership', 'Project', 'ProjectMember',
      'ApiKey', 'Provider', 'ProviderModel', 'Notification', 'RequestEvent',
      'SecurityEvent', 'RecoveryEvent', 'Budget', 'Configuration',
    ]);

    this.client = baseClient.$extends({
      query: {
        $allModels: {
          async findMany({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<unknown> }) {
            if (modelsWithSoftDelete.has(model)) {
              args.where = { ...args.where, deletedAt: args.where?.deletedAt ?? null };
            }
            return query(args);
          },
          async findFirst({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<unknown> }) {
            if (modelsWithSoftDelete.has(model)) {
              args.where = { ...args.where, deletedAt: args.where?.deletedAt ?? null };
            }
            return query(args);
          },
          async findUnique({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
            const result = await query(args);
            if (modelsWithSoftDelete.has(model) && result?.deletedAt !== null) {
              return null;
            }
            return result;
          },
          async findUniqueOrThrow({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
            const result = await query(args);
            if (modelsWithSoftDelete.has(model) && result?.deletedAt !== null) {
              throw new Error(`${model} record not found`);
            }
            return result;
          },
        },
      },
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
