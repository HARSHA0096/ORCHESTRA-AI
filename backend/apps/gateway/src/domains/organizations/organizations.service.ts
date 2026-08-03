import { ConflictError, NotFoundError, ForbiddenError, ErrorCode } from '@orchestra/errors';
import { eventBus } from '@orchestra/events';
import { slugify } from '@orchestra/shared';
import type { CreateOrganizationInput, UpdateOrganizationInput, InviteMemberInput, UpdateMemberRoleInput } from '@orchestra/validation';
import { OrganizationsRepository } from './organizations.repository.js';
import { prisma } from '@orchestra/database';

export class OrganizationsService {
  constructor(private readonly repo: OrganizationsRepository) {}

  async create(userId: string, input: CreateOrganizationInput) {
    const slug = input.slug ?? slugify(input.name);
    const existing = await this.repo.findBySlug(slug);
    if (existing) {
      throw new ConflictError('Organization slug already exists', ErrorCode.ORG_SLUG_EXISTS);
    }

    const org = await this.repo.create({ name: input.name, slug, description: input.description });
    await this.repo.addMember({ userId, organizationId: org.id, role: 'ORG_ADMIN' });
    eventBus.emit('org.created', { orgId: org.id, userId });
    return org;
  }

  async getUserOrganizations(userId: string) {
    const memberships = await this.repo.findByUserId(userId);
    return memberships.map((membership: { organization: Record<string, unknown>; role: string }) => ({
      ...membership.organization,
      role: membership.role,
    }));
  }

  async getById(orgId: string) {
    const org = await this.repo.findById(orgId);
    if (!org) throw new NotFoundError('Organization not found', ErrorCode.ORG_NOT_FOUND);
    return org;
  }

  async update(orgId: string, input: UpdateOrganizationInput) {
    const org = await this.repo.findById(orgId);
    if (!org) throw new NotFoundError('Organization not found', ErrorCode.ORG_NOT_FOUND);
    const updated = await this.repo.update(orgId, input);
    eventBus.emit('org.updated', { orgId });
    return updated;
  }

  async delete(orgId: string) {
    const org = await this.repo.findById(orgId);
    if (!org) throw new NotFoundError('Organization not found', ErrorCode.ORG_NOT_FOUND);
    await this.repo.softDelete(orgId);
  }

  async getMembers(orgId: string) {
    return this.repo.findMembers(orgId);
  }

  async inviteMember(orgId: string, inviterId: string, input: InviteMemberInput) {
    // Find the user by email
    const user = await prisma.user.findFirst({ where: { email: input.email, deletedAt: null } });
    if (!user) throw new NotFoundError('User not found with this email', ErrorCode.AUTH_USER_NOT_FOUND);

    const existing = await this.repo.findMembership(user.id, orgId);
    if (existing) throw new ConflictError('User is already a member', ErrorCode.ORG_MEMBER_EXISTS);

    return this.repo.addMember({
      userId: user.id,
      organizationId: orgId,
      role: input.role,
      invitedBy: inviterId,
      status: 'PENDING',
    });
  }

  async updateMemberRole(orgId: string, userId: string, memberId: string, input: UpdateMemberRoleInput) {
    const members = await this.repo.findMembers(orgId);
    const target = members.find((member: { id: string; userId: string }) => member.id === memberId);
    if (!target) throw new NotFoundError('Member not found', ErrorCode.ORG_NOT_FOUND);

    if (target.userId === userId) {
      throw new ForbiddenError('Cannot change your own role', ErrorCode.AUTH_FORBIDDEN);
    }

    return this.repo.updateMemberRole(memberId, input.role);
  }

  async removeMember(orgId: string, userId: string, memberId: string) {
    const members = await this.repo.findMembers(orgId);
    const target = members.find((member: { id: string; userId: string }) => member.id === memberId);
    if (!target) throw new NotFoundError('Member not found', ErrorCode.ORG_NOT_FOUND);

    if (target.userId === userId) {
      throw new ForbiddenError('Cannot remove yourself', ErrorCode.AUTH_FORBIDDEN);
    }

    await this.repo.removeMember(memberId);
  }
}
