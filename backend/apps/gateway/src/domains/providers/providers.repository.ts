import { prisma } from '@orchestra/database';

export class ProvidersRepository {
  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.provider.findMany({ where: { deletedAt: null }, skip, take, orderBy: { name: 'asc' }, include: { models: true } }),
      prisma.provider.count({ where: { deletedAt: null } }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    return prisma.provider.findFirst({ where: { id, deletedAt: null }, include: { models: true } });
  }

  async findByName(name: string) {
    return prisma.provider.findFirst({ where: { name, deletedAt: null } });
  }

  async create(data: { name: string; displayName: string; type: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'AZURE' | 'COHERE' | 'MISTRAL' | 'META' | 'CUSTOM'; baseUrl?: string; description?: string }) {
    return prisma.provider.create({ data });
  }

  async update(id: string, data: { displayName?: string; status?: 'ACTIVE' | 'INACTIVE' | 'DEGRADED'; baseUrl?: string; description?: string }) {
    return prisma.provider.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.provider.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async findModels(providerId: string) {
    return prisma.providerModel.findMany({ where: { providerId, deletedAt: null }, orderBy: { name: 'asc' } });
  }
}
