// ──────────────────────────────────────────────────────────────
// Orchestra AI — Provider Adapter Interface
// Every AI provider must implement this contract.
// Gateway communicates ONLY through this interface.
// ──────────────────────────────────────────────────────────────

import type { ExecutionContext, ProviderResponse, StreamChunk, ProviderModelInfo, ProviderCapabilities } from '../shared/types.js';

/**
 * Base interface that every AI provider adapter MUST implement.
 * The gateway never communicates directly with provider APIs.
 * All provider-specific logic is encapsulated behind this interface.
 */
export interface IProviderAdapter {
  /** Unique provider identifier (e.g. 'openai', 'claude', 'gemini') */
  readonly name: string;

  /** Human-readable name (e.g. 'OpenAI', 'Anthropic Claude') */
  readonly displayName: string;

  /** Provider type classification */
  readonly type: string;

  // ── Core Methods ──────────────────────────────
  /**
   * Generate a standard (non-streaming) response.
   * @throws {ProviderError} if the provider request fails
   */
  generate(context: ExecutionContext): Promise<ProviderResponse>;

  /**
   * Generate a streaming response, yielding chunks.
   * @returns AsyncIterable of StreamChunks
   */
  stream(context: ExecutionContext): AsyncIterable<StreamChunk>;

  // ── Discovery Methods ─────────────────────────
  /** Health check — returns true if provider is reachable */
  health(): Promise<boolean>;

  /** List available models for this provider */
  models(): Promise<ProviderModelInfo[]>;

  // ── Capability Methods ────────────────────────
  /** Provider capabilities */
  getCapabilities(): ProviderCapabilities;

  supportsStreaming(): boolean;
  supportsVision(): boolean;
  supportsFunctions(): boolean;
  supportsTools(): boolean;
  supportsJSON(): boolean;
  supportsEmbeddings(): boolean;
}

/**
 * Abstract base class that provides default implementations
 * for capability checks. Concrete providers extend this.
 */
export abstract class BaseProviderAdapter implements IProviderAdapter {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly type: string;

  protected abstract readonly capabilities: ProviderCapabilities;

  abstract generate(context: ExecutionContext): Promise<ProviderResponse>;
  abstract stream(context: ExecutionContext): AsyncIterable<StreamChunk>;
  abstract health(): Promise<boolean>;
  abstract models(): Promise<ProviderModelInfo[]>;

  getCapabilities(): ProviderCapabilities {
    return { ...this.capabilities };
  }

  supportsStreaming(): boolean { return this.capabilities.streaming; }
  supportsVision(): boolean { return this.capabilities.vision; }
  supportsFunctions(): boolean { return this.capabilities.functions; }
  supportsTools(): boolean { return this.capabilities.tools; }
  supportsJSON(): boolean { return this.capabilities.json; }
  supportsEmbeddings(): boolean { return this.capabilities.embeddings; }
}
