import { createHash } from 'node:crypto';
import { BaseProviderAdapter } from '../provider.interface.js';
import type { ExecutionContext, ProviderResponse, StreamChunk, ProviderModelInfo, ProviderCapabilities } from '../../shared/types.js';

const MODELS: ProviderModelInfo[] = [
  { id: 'orchestra-demo-model', name: 'Orchestra Demo Model', contextWindow: 128000, maxOutputTokens: 8192, inputCostPer1k: 0.001, outputCostPer1k: 0.002, capabilities: ['chat', 'streaming', 'tools', 'json'] },
  { id: 'orchestra-fast-demo', name: 'Orchestra Fast Demo', contextWindow: 64000, maxOutputTokens: 4096, inputCostPer1k: 0.001, outputCostPer1k: 0.002, capabilities: ['chat', 'streaming'] },
  { id: 'orchestra-reasoning-demo', name: 'Orchestra Reasoning Demo', contextWindow: 128000, maxOutputTokens: 8192, inputCostPer1k: 0.001, outputCostPer1k: 0.002, capabilities: ['chat', 'streaming', 'tools', 'json'] },
  { id: 'orchestra-demo-failure', name: 'Orchestra Demo Failure', contextWindow: 64000, maxOutputTokens: 4096, inputCostPer1k: 0.001, outputCostPer1k: 0.002, capabilities: ['chat', 'streaming'] },
];

function inputText(context: ExecutionContext): string {
  return context.prompt ?? context.messages?.map((m) => `${m.role}: ${m.content}`).join('\n') ?? 'Hello';
}

function stableNumber(input: string, min: number, max: number): number {
  const hash = createHash('sha256').update(input).digest();
  const n = hash.readUInt32BE(0);
  return min + (n % (max - min + 1));
}

function responseFor(context: ExecutionContext): string {
  const text = inputText(context).trim();
  const topic = text.length > 90 ? `${text.slice(0, 87)}...` : text;
  return `Orchestra AI Demo Response\n\nI processed your request through the ORCHESTRA middleware pipeline in Demo Mode.\n\nRequest: ${topic}\n\nThe request passed validation and security checks, was routed to the ${context.resolvedModel ?? context.model ?? 'orchestra-demo-model'} demo model, and produced this deterministic response. In a production deployment, the same gateway contract can route the request to a configured AI provider without changing the client interface.`;
}

function usageFor(context: ExecutionContext, content: string) {
  const promptTokens = Math.max(1, Math.ceil(inputText(context).length / 4));
  const completionTokens = Math.max(1, Math.ceil(content.length / 4));
  return { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens };
}

export class DemoAdapter extends BaseProviderAdapter {
  readonly name = 'demo';
  readonly displayName = 'Orchestra Demo';
  readonly type = 'CUSTOM';
  protected readonly capabilities: ProviderCapabilities = { streaming: true, vision: false, functions: true, tools: true, json: true, embeddings: false, images: false, audio: false };

  async generate(context: ExecutionContext): Promise<ProviderResponse> {
    if ((context.resolvedModel ?? context.model) === 'orchestra-demo-failure') {
      const error = new Error('Deterministic demo provider failure for recovery testing.') as Error & { errorCode: string; statusCode: number; retryable: boolean };
      error.errorCode = 'DEMO_PROVIDER_FAILURE';
      error.statusCode = 503;
      error.retryable = true;
      throw error;
    }
    const content = responseFor(context);
    return {
      content,
      provider: this.name,
      model: context.resolvedModel ?? context.model ?? MODELS[0]!.id,
      finishReason: 'stop',
      usage: usageFor(context, content),
      latencyMs: stableNumber(inputText(context), 18, 42),
      providerRequestId: `demo-${createHash('sha1').update(context.requestId).digest('hex').slice(0, 16)}`,
      metadata: { demo: true, deterministic: true },
    };
  }

  async *stream(context: ExecutionContext): AsyncIterable<StreamChunk> {
    const content = responseFor(context);
    const words = content.split(/(\s+)/).filter(Boolean);
    for (let index = 0; index < words.length; index += 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, 8));
      yield {
        id: `demo-chunk-${index}`,
        content: words[index]!,
        provider: this.name,
        model: context.resolvedModel ?? context.model ?? MODELS[0]!.id,
        finishReason: index === words.length - 1 ? 'stop' : undefined,
        index,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async health(): Promise<boolean> { return true; }
  async models(): Promise<ProviderModelInfo[]> { return MODELS.map((model) => ({ ...model, capabilities: [...model.capabilities] })); }
}
