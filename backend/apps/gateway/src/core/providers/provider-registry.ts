// ──────────────────────────────────────────────────────────────
// Orchestra AI — Provider Registry
// Dependency-injection-based auto-registration of all providers.
// No switch statements. No hardcoded provider logic.
// ──────────────────────────────────────────────────────────────

import { logger } from '@orchestra/logger';
import { ProviderManager } from './provider-manager.js';
import type { IProviderAdapter } from './provider.interface.js';
import {
  OpenAIAdapter,
  ClaudeAdapter,
  GeminiAdapter,
  DeepSeekAdapter,
  GroqAdapter,
  OllamaAdapter,
  OpenRouterAdapter,
  AzureOpenAIAdapter,
} from './adapters/index.js';

const log = logger.child({ module: 'provider-registry' });

/**
 * Registry of all known provider adapters.
 * Providers are registered via dependency injection — adding a new
 * provider only requires creating an adapter and adding it here.
 */
export class ProviderRegistry {
  private readonly manager: ProviderManager;

  constructor(manager?: ProviderManager) {
    this.manager = manager ?? new ProviderManager();
  }

  /**
   * Register all built-in provider adapters.
   */
  registerDefaults(): void {
    const adapters: IProviderAdapter[] = [
      new OpenAIAdapter(),
      new ClaudeAdapter(),
      new GeminiAdapter(),
      new DeepSeekAdapter(),
      new GroqAdapter(),
      new OllamaAdapter(),
      new OpenRouterAdapter(),
      new AzureOpenAIAdapter(),
    ];

    for (const adapter of adapters) {
      this.manager.registerProvider(adapter);
    }

    log.info({ count: adapters.length, providers: adapters.map((a) => a.name) }, 'All default providers registered');
  }

  /**
   * Register a custom provider adapter at runtime.
   */
  registerCustom(adapter: IProviderAdapter): void {
    this.manager.registerProvider(adapter);
    log.info({ provider: adapter.name }, 'Custom provider registered');
  }

  /**
   * Get the provider manager instance.
   */
  getManager(): ProviderManager {
    return this.manager;
  }
}
