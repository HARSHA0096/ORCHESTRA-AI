import { generateApiKey } from '@orchestra/auth';
import { NotFoundError, ErrorCode } from '@orchestra/errors';
import { eventBus } from '@orchestra/events';
import { paginate, buildPaginatedMeta } from '@orchestra/shared';
import type { CreateApiKeyInput, PaginationInput } from '@orchestra/validation';
import { ApiKeysRepository } from './api-keys.repository.js';

export class ApiKeysService {
  constructor(private readonly repo: ApiKeysRepository) {}

  async generate(projectId: string, orgId: string, userId: string, input: CreateApiKeyInput) {
    const { raw, prefix, hash } = generateApiKey();

    const apiKey = await this.repo.create({
      keyHash: hash,
      keyPrefix: prefix,
      name: input.name,
      description: input.description,
      organizationId: orgId,
      projectId,
      scopes: input.scopes,
      expiresAt: input.expiresAt,
      rateLimit: input.rateLimit,
      createdById: userId,
    });

    eventBus.emit('api-key.created', { apiKeyId: apiKey.id, projectId });

    // Return raw key ONCE — it's never stored or retrievable again
    return { ...apiKey, rawKey: raw };
  }

  async getByProject(projectId: string, pagination: PaginationInput) {
    const { skip, take } = paginate(pagination.page, pagination.perPage);
    const { data, total } = await this.repo.findByProjectId(projectId, skip, take);
    const masked = data.map((key: { keyPrefix: string; keyHash?: string; [key: string]: unknown }) => ({
      ...key,
      keyPrefix: key.keyPrefix,
      keyHash: undefined,
    }));
    return { data: masked, meta: buildPaginatedMeta(total, pagination.page, pagination.perPage) };
  }

  async getById(apiKeyId: string) {
    const key = await this.repo.findById(apiKeyId);
    if (!key) throw new NotFoundError('API key not found', ErrorCode.APIKEY_NOT_FOUND);
    return { ...key, keyHash: undefined };
  }

  async rotate(projectId: string, orgId: string, apiKeyId: string, userId: string) {
    const existing = await this.repo.findById(apiKeyId);
    if (!existing) throw new NotFoundError('API key not found', ErrorCode.APIKEY_NOT_FOUND);

    // Revoke old key
    await this.repo.update(apiKeyId, { status: 'REVOKED' });
    eventBus.emit('api-key.revoked', { apiKeyId });

    // Generate new key
    const { raw, prefix, hash } = generateApiKey();
    const newKey = await this.repo.create({
      keyHash: hash,
      keyPrefix: prefix,
      name: existing.name,
      description: existing.description ?? undefined,
      organizationId: orgId,
      projectId,
      scopes: existing.scopes,
      expiresAt: existing.expiresAt,
      rateLimit: existing.rateLimit,
      createdById: userId,
    });

    eventBus.emit('api-key.rotated', { apiKeyId: newKey.id });
    return { ...newKey, rawKey: raw };
  }

  async revoke(apiKeyId: string) {
    const key = await this.repo.findById(apiKeyId);
    if (!key) throw new NotFoundError('API key not found', ErrorCode.APIKEY_NOT_FOUND);
    await this.repo.update(apiKeyId, { status: 'REVOKED' });
    eventBus.emit('api-key.revoked', { apiKeyId });
  }

  async delete(apiKeyId: string) {
    const key = await this.repo.findById(apiKeyId);
    if (!key) throw new NotFoundError('API key not found', ErrorCode.APIKEY_NOT_FOUND);
    await this.repo.softDelete(apiKeyId);
  }
}
