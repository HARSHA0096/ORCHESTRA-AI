import { ConflictError, NotFoundError, ErrorCode } from '@orchestra/errors';
import { eventBus } from '@orchestra/events';
import { slugify, paginate, buildPaginatedMeta } from '@orchestra/shared';
import type { CreateProjectInput, UpdateProjectInput, PaginationInput } from '@orchestra/validation';
import { ProjectsRepository } from './projects.repository.js';

export class ProjectsService {
  constructor(private readonly repo: ProjectsRepository) {}

  async create(orgId: string, userId: string, input: CreateProjectInput) {
    const slug = input.slug ?? slugify(input.name);
    const existing = await this.repo.findBySlugAndOrg(slug, orgId);
    if (existing) throw new ConflictError('Project slug already exists in this organization', ErrorCode.PROJECT_SLUG_EXISTS);

    const project = await this.repo.create({ name: input.name, slug, description: input.description, organizationId: orgId });
    await this.repo.addMember(userId, project.id);
    eventBus.emit('project.created', { projectId: project.id, orgId });
    return project;
  }

  async getByOrg(orgId: string, pagination: PaginationInput) {
    const { skip, take } = paginate(pagination.page, pagination.perPage);
    const { data, total } = await this.repo.findByOrgId(orgId, skip, take);
    return { data, meta: buildPaginatedMeta(total, pagination.page, pagination.perPage) };
  }

  async getById(projectId: string) {
    const project = await this.repo.findById(projectId);
    if (!project) throw new NotFoundError('Project not found', ErrorCode.PROJECT_NOT_FOUND);
    return project;
  }

  async update(projectId: string, input: UpdateProjectInput) {
    const project = await this.repo.findById(projectId);
    if (!project) throw new NotFoundError('Project not found', ErrorCode.PROJECT_NOT_FOUND);
    const updated = await this.repo.update(projectId, input);
    eventBus.emit('project.updated', { projectId });
    return updated;
  }

  async delete(projectId: string) {
    const project = await this.repo.findById(projectId);
    if (!project) throw new NotFoundError('Project not found', ErrorCode.PROJECT_NOT_FOUND);
    await this.repo.softDelete(projectId);
  }

  async archive(projectId: string) {
    const project = await this.repo.findById(projectId);
    if (!project) throw new NotFoundError('Project not found', ErrorCode.PROJECT_NOT_FOUND);
    return this.repo.archive(projectId);
  }

  async duplicate(orgId: string, userId: string, projectId: string) {
    const project = await this.repo.findById(projectId);
    if (!project) throw new NotFoundError('Project not found', ErrorCode.PROJECT_NOT_FOUND);

    const newSlug = `${project.slug}-copy-${Date.now()}`;
    const dup = await this.repo.create({
      name: `${project.name} (Copy)`,
      slug: newSlug,
      description: project.description ?? undefined,
      organizationId: orgId,
    });
    await this.repo.addMember(userId, dup.id);
    return dup;
  }
}
