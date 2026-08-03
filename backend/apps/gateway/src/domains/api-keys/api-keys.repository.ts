import { prisma } from '@orchestra/database';

export class ApiKeysRepository {
  async findById(id: string) {
    return prisma.apiKey.findFirst({ where: { id, deletedAt: null } });
  }

  async findByProjectId(projectId: string, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.apiKey.findMany({ where: { projectId, deletedAt: null }, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.apiKey.count({ where: { projectId, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async findByKeyHash(keyHash: string) {
    return prisma.apiKey.findFirst({ where: { keyHash, deletedAt: null } });
  }

  async create(data: {
    keyHash: string; keyPrefix: string; name: string; description?: string;
    organizationId: string; projectId: string; scopes: string[];
    expiresAt?: Date; rateLimit: number; createdById: string;
  }) {
    return prisma.apiKey.create({ data });
  }

  async update(id: string, data: { status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED'; lastUsedAt?: Date }) {
    return prisma.apiKey.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.apiKey.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async updateLastUsed(id: string) {
    await prisma.apiKey.update({ where: { id }, data: { lastUsedAt: new Date() } });
  }
}
