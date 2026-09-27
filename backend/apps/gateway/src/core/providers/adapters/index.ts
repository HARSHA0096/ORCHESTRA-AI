export { DemoAdapter } from './demo.adapter.js';
// ──────────────────────────────────────────────────────────────
// Orchestra AI — Placeholder Provider Adapters
// Stub implementations for all supported AI providers.
// Real API integration is deferred to Sprint 3+.
// ──────────────────────────────────────────────────────────────

import { BaseProviderAdapter } from '../provider.interface.js';
import type { ExecutionContext, ProviderResponse, StreamChunk, ProviderModelInfo, ProviderCapabilities } from '../../shared/types.js';
import { logger } from '@orchestra/logger';
import { config } from '@orchestra/config';

const log = logger.child({ module: 'provider-adapter' });

function createStubResponse(context: ExecutionContext, providerName: string, modelName: string): ProviderResponse {
  return {
    content: `[${providerName}] Stub response for: ${context.prompt ?? context.messages?.at(-1)?.content ?? 'empty prompt'}`,
    provider: providerName,
    model: modelName,
    finishReason: 'stop',
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    latencyMs: 0,
    metadata: { stub: true, status: 'not-connected' },
  };
}

function getOpenAiApiKey(): string {
  const key = config.apiKey.openAiApiKey;
  if (!key || key.trim() === '') {
    throw new Error('OPENAI_API_KEY is not configured. Set it in the backend environment before using the real OpenAI adapter.');
  }
  return key;
}

class OpenAIProviderError extends Error {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly retryable: boolean;

  constructor(statusCode: number, errorCode: string, message: string, retryable: boolean) {
    super(message);
    this.name = 'OpenAIProviderError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.retryable = retryable;
  }
}

function sanitizeOpenAiError(statusCode: number, rawMessage?: string): OpenAIProviderError {
  const fallback = `OpenAI API request failed with status ${statusCode}`;
  const message = rawMessage && rawMessage.trim() ? rawMessage.trim() : fallback;

  if (statusCode === 400) return new OpenAIProviderError(400, 'OPENAI_BAD_REQUEST', message, false);
  if (statusCode === 401) return new OpenAIProviderError(401, 'OPENAI_AUTH_ERROR', 'OpenAI authentication failed.', false);
  if (statusCode === 408) return new OpenAIProviderError(408, 'OPENAI_TIMEOUT', 'OpenAI request timed out.', true);
  if (statusCode === 429) return new OpenAIProviderError(429, 'OPENAI_RATE_LIMIT', 'OpenAI rate limit reached.', true);
  if (statusCode >= 500) return new OpenAIProviderError(statusCode, 'OPENAI_SERVER_ERROR', message, true);
  return new OpenAIProviderError(statusCode, 'OPENAI_API_ERROR', message, statusCode === 408 || statusCode === 429 || statusCode >= 500);
}

function getOpenAiRequestTimeoutMs(): number {
  return 30_000;
}

function buildMessages(context: ExecutionContext): Array<Record<string, unknown>> {
  const fallbackPrompt = context.prompt ?? context.messages?.at(-1)?.content ?? 'Hello';

  if (context.messages && context.messages.length > 0) {
    return context.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      ...(msg.name ? { name: msg.name } : {}),
      ...(msg.toolCallId ? { tool_call_id: msg.toolCallId } : {}),
      ...(msg.toolCalls ? { tool_calls: msg.toolCalls } : {}),
    }));
  }

  return [{ role: 'user', content: fallbackPrompt }];
}

async function* createStubStream(context: ExecutionContext, providerName: string, modelName: string): AsyncIterable<StreamChunk> {
  const content = `[${providerName}] Streaming stub for: ${context.prompt ?? 'empty'}`;
  const words = content.split(' ');
  for (let i = 0; i < words.length; i++) {
    yield {
      id: `chunk-${i}`,
      content: (i === 0 ? '' : ' ') + words[i]!,
      provider: providerName,
      model: modelName,
      finishReason: i === words.length - 1 ? 'stop' : undefined,
      index: i,
      timestamp: new Date().toISOString(),
    };
  }
}

// ── OpenAI ──────────────────────────────────────
export class OpenAIAdapter extends BaseProviderAdapter {
  readonly name = 'openai';
  readonly displayName = 'OpenAI';
  readonly type = 'OPENAI';
  protected readonly capabilities: ProviderCapabilities = { streaming: true, vision: true, functions: true, tools: true, json: true, embeddings: true, images: true, audio: true };

  async generate(context: ExecutionContext): Promise<ProviderResponse> {
    const apiKey = getOpenAiApiKey();
    const modelName = context.resolvedModel ?? context.model ?? 'gpt-4o-mini';
    const startedAt = Date.now();

    log.info({ provider: this.name, model: modelName }, 'OpenAI generate (real API call)');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getOpenAiRequestTimeoutMs());

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: buildMessages(context),
          ...(context.temperature !== undefined ? { temperature: context.temperature } : {}),
          ...(context.maxTokens !== undefined ? { max_tokens: context.maxTokens } : {}),
          ...(context.topP !== undefined ? { top_p: context.topP } : {}),
          ...(context.stop ? { stop: context.stop } : {}),
          ...(context.frequencyPenalty !== undefined ? { frequency_penalty: context.frequencyPenalty } : {}),
          ...(context.presencePenalty !== undefined ? { presence_penalty: context.presencePenalty } : {}),
          ...(context.tools ? { tools: context.tools } : {}),
          ...(context.toolChoice !== undefined ? { tool_choice: context.toolChoice } : {}),
          ...(context.responseFormat ? { response_format: { type: context.responseFormat === 'json' ? 'json_object' : 'text' } } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMessage = `OpenAI API request failed with status ${response.status}`;
        try {
          const errorPayload = await response.json() as { error?: { message?: string } };
          if (errorPayload?.error?.message) {
            errorMessage = errorPayload.error.message;
          }
        } catch {
          // Ignore malformed JSON and keep the status fallback.
        }
        throw sanitizeOpenAiError(response.status, errorMessage);
      }

      const payload = await response.json() as {
        id?: string;
        choices?: Array<{ message?: { content?: string | null; tool_calls?: import('../../shared/types.js').ToolCall[] }; finish_reason?: string }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      };

      const choice = payload.choices?.[0];
      const usage = payload.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return {
        content: choice?.message?.content ?? '',
        provider: this.name,
        model: modelName,
        finishReason: (choice?.finish_reason as 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'error') ?? 'stop',
        usage: {
          promptTokens: usage.prompt_tokens ?? 0,
          completionTokens: usage.completion_tokens ?? 0,
          totalTokens: usage.total_tokens ?? (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
        },
        latencyMs: Date.now() - startedAt,
        providerRequestId: payload.id,
        toolCalls: choice?.message?.tool_calls,
        metadata: { connected: true, rawFinishReason: choice?.finish_reason ?? 'stop' },
      };
    } catch (error) {
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
        throw new OpenAIProviderError(408, 'OPENAI_TIMEOUT', 'OpenAI request timed out.', true);
      }

      if (error instanceof TypeError) {
        throw new OpenAIProviderError(503, 'OPENAI_NETWORK_ERROR', 'OpenAI network request failed.', true);
      }

      if (error instanceof OpenAIProviderError) {
        throw error;
      }

      throw new OpenAIProviderError(500, 'OPENAI_API_ERROR', error instanceof Error ? error.message : 'OpenAI request failed.', true);
    } finally {
      clearTimeout(timeoutId);
    }
  }
  async *stream(context: ExecutionContext): AsyncIterable<StreamChunk> { yield* createStubStream(context, this.name, context.resolvedModel ?? 'gpt-4o'); }
  async health(): Promise<boolean> { return true; }
  async models(): Promise<ProviderModelInfo[]> {
    return [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, maxOutputTokens: 16384, inputCostPer1k: 0.005, outputCostPer1k: 0.015, capabilities: ['chat', 'vision', 'tools', 'json'] },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, maxOutputTokens: 16384, inputCostPer1k: 0.00015, outputCostPer1k: 0.0006, capabilities: ['chat', 'vision', 'tools', 'json'] },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, maxOutputTokens: 4096, inputCostPer1k: 0.01, outputCostPer1k: 0.03, capabilities: ['chat', 'vision', 'tools', 'json'] },
    ];
  }
}

// ── Anthropic Claude ────────────────────────────
export class ClaudeAdapter extends BaseProviderAdapter {
  readonly name = 'claude';
  readonly displayName = 'Anthropic Claude';
  readonly type = 'ANTHROPIC';
  protected readonly capabilities: ProviderCapabilities = { streaming: true, vision: true, functions: true, tools: true, json: true, embeddings: false, images: false, audio: false };

  async generate(context: ExecutionContext): Promise<ProviderResponse> {
    log.debug({ provider: this.name }, 'Claude generate (stub)');
    return createStubResponse(context, this.name, context.resolvedModel ?? 'claude-sonnet-4-20250514');
  }
  async *stream(context: ExecutionContext): AsyncIterable<StreamChunk> { yield* createStubStream(context, this.name, context.resolvedModel ?? 'claude-sonnet-4-20250514'); }
  async health(): Promise<boolean> { return true; }
  async models(): Promise<ProviderModelInfo[]> {
    return [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', contextWindow: 200000, maxOutputTokens: 64000, inputCostPer1k: 0.003, outputCostPer1k: 0.015, capabilities: ['chat', 'vision', 'tools'] },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextWindow: 200000, maxOutputTokens: 8192, inputCostPer1k: 0.001, outputCostPer1k: 0.005, capabilities: ['chat', 'tools'] },
    ];
  }
}

// ── Google Gemini ────────────────────────────────
export class GeminiAdapter extends BaseProviderAdapter {
  readonly name = 'gemini';
  readonly displayName = 'Google Gemini';
  readonly type = 'GOOGLE';
  protected readonly capabilities: ProviderCapabilities = { streaming: true, vision: true, functions: true, tools: true, json: true, embeddings: true, images: true, audio: true };

  async generate(context: ExecutionContext): Promise<ProviderResponse> {
    log.debug({ provider: this.name }, 'Gemini generate (stub)');
    return createStubResponse(context, this.name, context.resolvedModel ?? 'gemini-2.5-pro');
  }
  async *stream(context: ExecutionContext): AsyncIterable<StreamChunk> { yield* createStubStream(context, this.name, context.resolvedModel ?? 'gemini-2.5-pro'); }
  async health(): Promise<boolean> { return true; }
  async models(): Promise<ProviderModelInfo[]> {
    return [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', contextWindow: 1048576, maxOutputTokens: 65536, inputCostPer1k: 0.00125, outputCostPer1k: 0.01, capabilities: ['chat', 'vision', 'tools', 'json'] },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', contextWindow: 1048576, maxOutputTokens: 65536, inputCostPer1k: 0.00015, outputCostPer1k: 0.0006, capabilities: ['chat', 'vision', 'tools', 'json'] },
    ];
  }
}

// ── DeepSeek ────────────────────────────────────
export class DeepSeekAdapter extends BaseProviderAdapter {
  readonly name = 'deepseek';
  readonly displayName = 'DeepSeek';
  readonly type = 'CUSTOM';
  protected readonly capabilities: ProviderCapabilities = { streaming: true, vision: false, functions: true, tools: true, json: true, embeddings: false, images: false, audio: false };

  async generate(context: ExecutionContext): Promise<ProviderResponse> { return createStubResponse(context, this.name, 'deepseek-chat'); }
  async *stream(context: ExecutionContext): AsyncIterable<StreamChunk> { yield* createStubStream(context, this.name, 'deepseek-chat'); }
  async health(): Promise<boolean> { return true; }
  async models(): Promise<ProviderModelInfo[]> {
    return [{ id: 'deepseek-chat', name: 'DeepSeek Chat', contextWindow: 128000, maxOutputTokens: 8192, inputCostPer1k: 0.00014, outputCostPer1k: 0.00028, capabilities: ['chat', 'tools'] }];
  }
}

// ── Groq ────────────────────────────────────────
export class GroqAdapter extends BaseProviderAdapter {
  readonly name = 'groq';
  readonly displayName = 'Groq';
  readonly type = 'CUSTOM';
  protected readonly capabilities: ProviderCapabilities = { streaming: true, vision: true, functions: true, tools: true, json: true, embeddings: false, images: false, audio: false };

  async generate(context: ExecutionContext): Promise<ProviderResponse> { return createStubResponse(context, this.name, 'llama-3.3-70b-versatile'); }
  async *stream(context: ExecutionContext): AsyncIterable<StreamChunk> { yield* createStubStream(context, this.name, 'llama-3.3-70b-versatile'); }
  async health(): Promise<boolean> { return true; }
  async models(): Promise<ProviderModelInfo[]> {
    return [{ id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', contextWindow: 131072, maxOutputTokens: 32768, inputCostPer1k: 0.00059, outputCostPer1k: 0.00079, capabilities: ['chat', 'tools'] }];
  }
}

// ── Ollama ───────────────────────────────────────
export class OllamaAdapter extends BaseProviderAdapter {
  readonly name = 'ollama';
  readonly displayName = 'Ollama (Local)';
  readonly type = 'CUSTOM';
  protected readonly capabilities: ProviderCapabilities = { streaming: true, vision: false, functions: false, tools: false, json: true, embeddings: true, images: false, audio: false };

  async generate(context: ExecutionContext): Promise<ProviderResponse> { return createStubResponse(context, this.name, 'llama3'); }
  async *stream(context: ExecutionContext): AsyncIterable<StreamChunk> { yield* createStubStream(context, this.name, 'llama3'); }
  async health(): Promise<boolean> { return true; }
  async models(): Promise<ProviderModelInfo[]> {
    return [{ id: 'llama3', name: 'Llama 3', contextWindow: 8192, maxOutputTokens: 4096, inputCostPer1k: 0, outputCostPer1k: 0, capabilities: ['chat'] }];
  }
}

// ── OpenRouter ───────────────────────────────────
export class OpenRouterAdapter extends BaseProviderAdapter {
  readonly name = 'openrouter';
  readonly displayName = 'OpenRouter';
  readonly type = 'CUSTOM';
  protected readonly capabilities: ProviderCapabilities = { streaming: true, vision: true, functions: true, tools: true, json: true, embeddings: false, images: false, audio: false };

  async generate(context: ExecutionContext): Promise<ProviderResponse> { return createStubResponse(context, this.name, 'auto'); }
  async *stream(context: ExecutionContext): AsyncIterable<StreamChunk> { yield* createStubStream(context, this.name, 'auto'); }
  async health(): Promise<boolean> { return true; }
  async models(): Promise<ProviderModelInfo[]> {
    return [{ id: 'auto', name: 'Auto Router', contextWindow: 128000, maxOutputTokens: 16384, inputCostPer1k: 0, outputCostPer1k: 0, capabilities: ['chat', 'tools'] }];
  }
}

// ── Azure OpenAI ─────────────────────────────────
export class AzureOpenAIAdapter extends BaseProviderAdapter {
  readonly name = 'azure-openai';
  readonly displayName = 'Azure OpenAI';
  readonly type = 'AZURE';
  protected readonly capabilities: ProviderCapabilities = { streaming: true, vision: true, functions: true, tools: true, json: true, embeddings: true, images: true, audio: false };

  async generate(context: ExecutionContext): Promise<ProviderResponse> { return createStubResponse(context, this.name, 'gpt-4o'); }
  async *stream(context: ExecutionContext): AsyncIterable<StreamChunk> { yield* createStubStream(context, this.name, 'gpt-4o'); }
  async health(): Promise<boolean> { return true; }
  async models(): Promise<ProviderModelInfo[]> {
    return [{ id: 'gpt-4o', name: 'GPT-4o (Azure)', contextWindow: 128000, maxOutputTokens: 16384, inputCostPer1k: 0.005, outputCostPer1k: 0.015, capabilities: ['chat', 'vision', 'tools'] }];
  }
}
