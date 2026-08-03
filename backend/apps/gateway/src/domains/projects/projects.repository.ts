import { prisma } from '@orchestra/database';

export class ProjectsRepository {
  async findById(id: string) {
    return prisma.project.findFirst({ where: { id, deletedAt: null } });
  }

  async findByOrgId(orgId: string, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.project.findMany({ where: { organizationId: orgId, deletedAt: null }, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.project.count({ where: { organizationId: orgId, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async findBySlugAndOrg(slug: string, orgId: string) {
    return prisma.project.findFirst({ where: { slug, organizationId: orgId, deletedAt: null } });
  }

  async create(data: { name: string; slug: string; description?: string; organizationId: string }) {
    return prisma.project.create({ data });
  }

  async update(id: string, data: { name?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) {
    return prisma.project.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async archive(id: string) {
    return prisma.project.update({ where: { id }, data: { archived: true, status: 'ARCHIVED' } });
  }

  async unarchive(id: string) {
    return prisma.project.update({ where: { id }, data: { archived: false, status: 'ACTIVE' } });
  }

  async addMember(userId: string, projectId: string, role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DEVELOPER' | 'VIEWER' = 'DEVELOPER') {
    return prisma.projectMember.create({ data: { userId, projectId, role } });
  }
}
