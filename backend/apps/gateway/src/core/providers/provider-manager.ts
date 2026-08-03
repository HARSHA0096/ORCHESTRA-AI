// ──────────────────────────────────────────────────────────────
// Orchestra AI — Provider Manager
// Central registry for all AI provider adapters.
// Supports registration, resolution, listing, and health monitoring.
// ──────────────────────────────────────────────────────────────

import { logger } from '@orchestra/logger';
import type { IProviderAdapter } from './provider.interface.js';
import type { ProviderInfo, ProviderCapabilities, ProviderModelInfo } from '../shared/types.js';

const log = logger.child({ module: 'provider-manager' });

export class ProviderManager {
  private readonly providers = new Map<string, IProviderAdapter>();

  // ── Registration ──────────────────────────────
  registerProvider(adapter: IProviderAdapter): void {
    if (this.providers.has(adapter.name)) {
      log.warn({ provider: adapter.name }, 'Provider already registered, replacing');
    }
    this.providers.set(adapter.name, adapter);
    log.info({ provider: adapter.name, displayName: adapter.displayName, type: adapter.type }, 'Provider registered');
  }

  unregisterProvider(name: string): boolean {
    const removed = this.providers.delete(name);
    if (removed) {
      log.info({ provider: name }, 'Provider unregistered');
    }
    return removed;
  }

  // ── Resolution ────────────────────────────────
  resolveProvider(name: string): IProviderAdapter | undefined {
    return this.providers.get(name);
  }

  getProvider(name: string): IProviderAdapter {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider "${name}" not found. Available: ${this.getProviderNames().join(', ')}`);
    }
    return provider;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  // ── Listing ───────────────────────────────────
  listProviders(): IProviderAdapter[] {
    return Array.from(this.providers.values());
  }

  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  getProviderCount(): number {
    return this.providers.size;
  }

  // ── Provider Info ─────────────────────────────
  async getProviderInfo(name: string): Promise<ProviderInfo> {
    const adapter = this.getProvider(name);
    const models = await adapter.models();
    return {
      name: adapter.name,
      displayName: adapter.displayName,
      type: adapter.type,
      status: 'active',
      capabilities: adapter.getCapabilities(),
      models,
    };
  }

  async getAllProviderInfos(): Promise<ProviderInfo[]> {
    const infos: ProviderInfo[] = [];
    for (const adapter of this.providers.values()) {
      try {
        const models = await adapter.models();
        infos.push({
          name: adapter.name,
          displayName: adapter.displayName,
          type: adapter.type,
          status: 'active',
          capabilities: adapter.getCapabilities(),
          models,
        });
      } catch (err) {
        log.warn({ provider: adapter.name, err }, 'Failed to get provider info');
        infos.push({
          name: adapter.name,
          displayName: adapter.displayName,
          type: adapter.type,
          status: 'degraded',
          capabilities: adapter.getCapabilities(),
          models: [],
        });
      }
    }
    return infos;
  }

  // ── Models ────────────────────────────────────
  async listModels(providerName: string): Promise<ProviderModelInfo[]> {
    const adapter = this.getProvider(providerName);
    return adapter.models();
  }

  // ── Capabilities ──────────────────────────────
  getCapabilities(providerName: string): ProviderCapabilities {
    const adapter = this.getProvider(providerName);
    return adapter.getCapabilities();
  }

  findProvidersByCapability(capability: keyof ProviderCapabilities): IProviderAdapter[] {
    return this.listProviders().filter((p) => p.getCapabilities()[capability]);
  }

  // ── Health ────────────────────────────────────
  async healthCheck(providerName: string): Promise<boolean> {
    const adapter = this.getProvider(providerName);
    try {
      return await adapter.health();
    } catch (err) {
      log.error({ provider: providerName, err }, 'Health check failed');
      return false;
    }
  }

  async healthCheckAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const checks = Array.from(this.providers.entries()).map(async ([name, adapter]) => {
      try {
        const healthy = await adapter.health();
        results.set(name, healthy);
      } catch {
        results.set(name, false);
      }
    });
    await Promise.allSettled(checks);
    return results;
  }
}
