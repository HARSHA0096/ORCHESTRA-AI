import { NotFoundError, ConflictError, ErrorCode } from '@orchestra/errors';
import { paginate, buildPaginatedMeta } from '@orchestra/shared';
import type { PaginationInput } from '@orchestra/validation';
import { ProvidersRepository } from './providers.repository.js';

export class ProvidersService {
  constructor(private readonly repo: ProvidersRepository) {}

  async listProviders(pagination: PaginationInput) {
    const { skip, take } = paginate(pagination.page, pagination.perPage);
    const { data, total } = await this.repo.findAll(skip, take);
    return { data, meta: buildPaginatedMeta(total, pagination.page, pagination.perPage) };
  }

  async getProvider(id: string) {
    const provider = await this.repo.findById(id);
    if (!provider) throw new NotFoundError('Provider not found', ErrorCode.PROVIDER_NOT_FOUND);
    return provider;
  }

  async createProvider(input: { name: string; displayName: string; type: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'AZURE' | 'COHERE' | 'MISTRAL' | 'META' | 'CUSTOM'; baseUrl?: string; description?: string }) {
    const existing = await this.repo.findByName(input.name);
    if (existing) throw new ConflictError('Provider name already exists', ErrorCode.CONFLICT);
    return this.repo.create(input);
  }

  async updateProvider(id: string, input: { displayName?: string; status?: 'ACTIVE' | 'INACTIVE' | 'DEGRADED'; baseUrl?: string; description?: string }) {
    const provider = await this.repo.findById(id);
    if (!provider) throw new NotFoundError('Provider not found', ErrorCode.PROVIDER_NOT_FOUND);
    return this.repo.update(id, input);
  }

  async listModels(providerId: string) {
    const provider = await this.repo.findById(providerId);
    if (!provider) throw new NotFoundError('Provider not found', ErrorCode.PROVIDER_NOT_FOUND);
    return this.repo.findModels(providerId);
  }

  // Future methods:
  // async routeRequest(request: AIRequest): Promise<AIResponse>
  // async healthCheck(providerId: string): Promise<HealthStatus>
  // async getProviderMetrics(providerId: string): Promise<Metrics>
}
