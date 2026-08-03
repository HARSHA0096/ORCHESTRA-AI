import { paginate, buildPaginatedMeta } from '@orchestra/shared';
import { eventBus } from '@orchestra/events';
import type { PaginationInput } from '@orchestra/validation';
import { AuditRepository } from './audit.repository.js';

export class AuditService {
  constructor(private readonly repo: AuditRepository) {}

  async log(data: {
    userId?: string; organizationId?: string; action: string; resource: string;
    resourceId?: string; description?: string; metadata?: Record<string, unknown>;
    ipAddress?: string; userAgent?: string;
  }) {
    const entry = await this.repo.create(data);
    eventBus.emit('audit.logged', { action: data.action, resource: data.resource, resourceId: data.resourceId });
    return entry;
  }

  async getOrgAuditLogs(orgId: string, pagination: PaginationInput, filters?: { action?: string; resource?: string }) {
    const { skip, take } = paginate(pagination.page, pagination.perPage);
    const { data, total } = await this.repo.findByOrgId(orgId, skip, take, filters);
    return { data, meta: buildPaginatedMeta(total, pagination.page, pagination.perPage) };
  }
}
