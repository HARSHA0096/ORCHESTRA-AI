import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '@orchestra/shared';
import type { RequestType } from '../shared/types.js';
import { GatewayService } from './gateway.service.js';

export function createGatewayController(service: GatewayService) {
  return {
    async execute(request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as {
        prompt?: string;
        provider?: string;
        model?: string;
        projectId?: string;
        requestType?: string;
        streaming?: boolean;
        metadata?: Record<string, unknown>;
        messages?: import('../shared/types.js').ChatMessage[];
        temperature?: number;
        topP?: number;
        maxTokens?: number;
        stop?: string[];
        frequencyPenalty?: number;
        presencePenalty?: number;
        responseFormat?: 'text' | 'json';
        tools?: import('../shared/types.js').ToolDefinition[];
        toolChoice?: unknown;
      };

      const result = await service.execute({
        prompt: body.prompt ?? '',
        messages: body.messages,
        provider: body.provider,
        model: body.model,
        userId: request.user?.sub,
        organizationId: request.requestContext?.organizationId,
        projectId: body.projectId,
        endpoint: request.routeOptions.url ?? request.url,
        apiKey: request.headers['x-api-key'] as string | undefined,
        requestType: body.requestType as RequestType | undefined,
        streaming: body.streaming ?? false,
        metadata: body.metadata,
        temperature: body.temperature,
        topP: body.topP,
        maxTokens: body.maxTokens,
        stop: body.stop,
        frequencyPenalty: body.frequencyPenalty,
        presencePenalty: body.presencePenalty,
        responseFormat: body.responseFormat,
        tools: body.tools,
        toolChoice: body.toolChoice,
      });

      const response: ApiResponse<typeof result.data> = {
        success: true,
        message: result.message,
        data: result.data,
        requestId: result.requestId,
        timestamp: result.timestamp,
      };

      return reply.send(response);
    },
  };
}
