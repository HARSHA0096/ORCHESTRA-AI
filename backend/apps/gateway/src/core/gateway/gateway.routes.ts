import type { FastifyInstance } from 'fastify';
import { authenticateJwt, validateBody } from '@orchestra/middleware';
import { GatewayService } from './gateway.service.js';
import { createGatewayController } from './gateway.controller.js';
import { DevelopmentAuthenticationProvider, DemoAuthenticationProvider } from '../auth/authentication-provider.js';
import { config } from '@orchestra/config';
import { openAiChatCompletionSchema, type OpenAiChatCompletionInput } from './gateway.validation.js';

function toGatewayInput(body: OpenAiChatCompletionInput, identity: { userId: string; organizationId: string; projectId: string }, requestUrl: string, onStreamChunk?: (chunk: import('../shared/types.js').StreamChunk) => void) {
  return {
    model: body.model,
    provider: (config.demo?.enabled ?? false) || body.model.startsWith('orchestra-demo') ? 'demo' : 'openai',
    messages: body.messages.map((message) => ({
      role: message.role,
      content: message.content,
      name: message.name,
      toolCallId: message.tool_call_id,
      toolCalls: message.tool_calls,
    })),
    temperature: body.temperature,
    topP: body.top_p,
    maxTokens: body.max_completion_tokens ?? body.max_tokens,
    stop: typeof body.stop === 'string' ? [body.stop] : body.stop,
    presencePenalty: body.presence_penalty,
    frequencyPenalty: body.frequency_penalty,
    tools: body.tools?.map((tool) => ({
      type: 'function' as const,
      function: { name: tool.function.name, description: tool.function.description ?? '', parameters: tool.function.parameters },
    })),
    toolChoice: body.tool_choice,
    responseFormat: body.response_format?.type === 'json_object' ? 'json' as const : 'text' as const,
    streaming: body.stream ?? false,
    requestType: 'chat' as const,
    endpoint: requestUrl,
    userId: identity.userId,
    organizationId: identity.organizationId,
    projectId: identity.projectId,
    onStreamChunk,
  };
}

export async function gatewayRoutes(fastify: FastifyInstance): Promise<void> {
  const service = new GatewayService();
  const controller = createGatewayController(service);
  fastify.get('/provider-health', {
    schema: { tags: ['Gateway'], description: 'Live health status for registered provider adapters', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: async (request, reply) => {
      const results = await service.getProviderManager().healthCheckAll();
      const providers = Array.from(results.entries()).map(([provider, healthy]) => ({
        provider,
        status: healthy ? 'healthy' : 'unhealthy',
      }));
      const unhealthy = providers.filter((item) => item.status === 'unhealthy').length;
      return reply.send({
        success: true,
        message: 'Provider health retrieved',
        data: {
          status: unhealthy === 0 ? 'healthy' : unhealthy === providers.length ? 'unhealthy' : 'degraded',
          providers,
        },
        requestId: request.id,
        timestamp: new Date().toISOString(),
      });
    },
  });

  fastify.post('/', {
    schema: { tags: ['Gateway'], description: 'Execute an AI request through the middleware core', security: [{ bearerAuth: [] }] },
    preHandler: [authenticateJwt],
    handler: controller.execute,
  });
}

export async function openAiCompatibleRoutes(fastify: FastifyInstance): Promise<void> {
  const service = new GatewayService();
  const authentication = (config.demo?.enabled ?? false) ? new DemoAuthenticationProvider() : new DevelopmentAuthenticationProvider();

  fastify.get('/models', {
    schema: { tags: ['OpenAI Compatible'], description: 'List models available to the configured gateway environment' },
  }, async (_request, reply) => {
    const manager = service.getProviderManager();
    const providers = (config.demo?.enabled ?? false) ? ['demo'] : manager.getProviderNames();
    const models = [];
    for (const providerName of providers) {
      const adapter = manager.resolveProvider(providerName);
      if (!adapter) continue;
      for (const model of await adapter.models()) {
        models.push({ id: model.id, object: 'model', created: 0, owned_by: providerName });
      }
    }
    return reply.send({ object: 'list', data: models });
  });

  fastify.post<{ Body: OpenAiChatCompletionInput }>('/chat/completions', {
    schema: { tags: ['OpenAI Compatible'], description: 'OpenAI-compatible chat completion endpoint' },
    preHandler: [validateBody(openAiChatCompletionSchema as never)],
    handler: async (request, reply) => {
      const body = request.body;
      const identity = await authentication.authenticate(request);

      if (body.stream) {
        reply.hijack();
        reply.raw.statusCode = 200;
        reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
        reply.raw.setHeader('Connection', 'keep-alive');
        reply.raw.setHeader('X-Accel-Buffering', 'no');
        const streamId = `chatcmpl-demo-${Date.now()}`;
        try {
          await service.execute(toGatewayInput(body, identity, request.routeOptions.url ?? request.url, (chunk) => {
            reply.raw.write(`data: ${JSON.stringify({
              id: streamId,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: body.model,
              choices: [{ index: 0, delta: { content: chunk.content }, finish_reason: chunk.finishReason ?? null }],
            })}\n\n`);
          }));
          reply.raw.write('data: [DONE]\n\n');
        } catch (error) {
          reply.raw.write(`data: ${JSON.stringify({ error: { message: error instanceof Error ? error.message : 'Streaming request failed', type: 'gateway_error' } })}\n\n`);
        } finally {
          reply.raw.end();
        }
        return;
      }

      const result = await service.execute(toGatewayInput(body, identity, request.routeOptions.url ?? request.url));
      const created = Math.floor(Date.now() / 1000);
      return reply.send({
        id: result.data.providerRequestId ?? `chatcmpl-${result.requestId}`,
        object: 'chat.completion',
        created,
        model: result.data.model,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: result.data.response, ...(result.data.toolCalls ? { tool_calls: result.data.toolCalls } : {}) },
          finish_reason: result.data.finishReason,
        }],
        usage: {
          prompt_tokens: result.data.usage.promptTokens,
          completion_tokens: result.data.usage.completionTokens,
          total_tokens: result.data.usage.totalTokens,
        },
      });
    },
  });
}
