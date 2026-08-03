import { prisma, type Prisma } from '@orchestra/database';

export class OrganizationsRepository {
  async findById(id: string) {
    return prisma.organization.findFirst({ where: { id, deletedAt: null } });
  }

  async findBySlug(slug: string) {
    return prisma.organization.findFirst({ where: { slug, deletedAt: null } });
  }

  async findByUserId(userId: string) {
    return prisma.orgMembership.findMany({
      where: { userId, deletedAt: null },
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.OrganizationCreateInput) {
    return prisma.organization.create({ data });
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput) {
    return prisma.organization.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.organization.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async findMembers(orgId: string) {
    return prisma.orgMembership.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findMembership(userId: string, orgId: string) {
    return prisma.orgMembership.findFirst({
      where: { userId, organizationId: orgId, deletedAt: null },
    });
  }

  async addMember(data: { userId: string; organizationId: string; role: string; invitedBy?: string; status?: string }) {
    return prisma.orgMembership.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        role: data.role as 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DEVELOPER' | 'VIEWER',
        status: (data.status as 'ACTIVE' | 'PENDING') ?? 'ACTIVE',
        invitedBy: data.invitedBy,
        invitedAt: data.invitedBy ? new Date() : undefined,
        joinedAt: !data.invitedBy ? new Date() : undefined,
      },
    });
  }

  async updateMemberRole(membershipId: string, role: string) {
    return prisma.orgMembership.update({
      where: { id: membershipId },
      data: { role: role as 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DEVELOPER' | 'VIEWER' },
    });
  }

  async removeMember(membershipId: string) {
    return prisma.orgMembership.update({
      where: { id: membershipId },
      data: { deletedAt: new Date() },
    });
  }

  async countMembers(orgId: string) {
    return prisma.orgMembership.count({ where: { organizationId: orgId, deletedAt: null } });
  }
}
