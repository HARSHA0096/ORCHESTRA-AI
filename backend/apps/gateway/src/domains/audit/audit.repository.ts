import { prisma } from '@orchestra/database';

export class AuditRepository {
  async create(data: {
    userId?: string; organizationId?: string; action: string; resource: string;
    resourceId?: string; description?: string; metadata?: Record<string, unknown>;
    ipAddress?: string; userAgent?: string;
  }) {
    return prisma.auditLog.create({ data: { ...data, metadata: data.metadata ?? undefined } });
  }

  async findByOrgId(orgId: string, skip: number, take: number, filters?: { action?: string; resource?: string }) {
    const where: Record<string, unknown> = { organizationId: orgId };
    if (filters?.action) where['action'] = filters.action;
    if (filters?.resource) where['resource'] = filters.resource;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, total };
  }
}
