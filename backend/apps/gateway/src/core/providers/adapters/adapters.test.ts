import { beforeEach, describe, expect, it, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('@orchestra/database', () => ({
  prisma: {
    project: { findFirst: vi.fn().mockResolvedValue({ id: 'project-1', organizationId: 'organization-1' }) },
    provider: { findFirst: vi.fn().mockResolvedValue(null) },
    budget: { findFirst: vi.fn().mockResolvedValue(null) },
    requestEvent: { create: vi.fn().mockResolvedValue({ id: 'request-event-1' }) },
    securityEvent: { create: vi.fn() },
  },
}));

vi.mock('@orchestra/config', () => ({
  config: { apiKey: { openAiApiKey: 'test-openai-key' }, development: { projectId: 'project-1' } },
}));

import { OpenAIAdapter } from './index.js';
import { openAiCompatibleRoutes } from '../../gateway/gateway.routes.js';

describe('OpenAIAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the normalized chat request and maps the OpenAI response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 'chatcmpl-test',
      choices: [{
        message: { content: 'Hello', tool_calls: [] },
        finish_reason: 'stop',
      }],
      usage: { prompt_tokens: 12, completion_tokens: 4, total_tokens: 16 },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await new OpenAIAdapter().generate({
      requestId: 'request-1',
      correlationId: 'correlation-1',
      executionId: 'execution-1',
      requestType: 'chat',
      streaming: false,
      status: 'received',
      retryCount: 0,
      maxRetries: 0,
      currentStage: 'provider',
      stages: [],
      timestamp: new Date().toISOString(),
      startedAt: Date.now(),
      executionDurationMs: 0,
      headers: {},
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Be concise' },
        { role: 'user', content: 'Hello' },
      ],
      temperature: 0.4,
      topP: 0.8,
      maxTokens: 200,
      metadata: {},
      customMetadata: {},
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-openai-key' });
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Be concise' },
        { role: 'user', content: 'Hello' },
      ],
      temperature: 0.4,
      top_p: 0.8,
      max_tokens: 200,
    });
    expect(result).toMatchObject({
      content: 'Hello',
      provider: 'openai',
      model: 'gpt-4o-mini',
      providerRequestId: 'chatcmpl-test',
      usage: { promptTokens: 12, completionTokens: 4, totalTokens: 16 },
    });
  });

  it('throws a sanitized timeout error when the OpenAI request times out', async () => {
    const timeoutError = new Error('The operation was aborted');
    (timeoutError as Error & { name?: string }).name = 'AbortError';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeoutError));

    await expect(
      new OpenAIAdapter().generate({
        requestId: 'request-timeout',
        correlationId: 'corr-timeout',
        executionId: 'execution-timeout',
        requestType: 'chat',
        streaming: false,
        status: 'received',
        retryCount: 0,
        maxRetries: 0,
        currentStage: 'provider',
        stages: [],
        timestamp: new Date().toISOString(),
        startedAt: Date.now(),
        executionDurationMs: 0,
        headers: {},
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        metadata: {},
        customMetadata: {},
      }),
    ).rejects.toMatchObject({
      name: 'OpenAIProviderError',
      statusCode: 408,
      errorCode: 'OPENAI_TIMEOUT',
      retryable: true,
    });
  });

  it('throws a sanitized network error when the OpenAI request cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(
      new OpenAIAdapter().generate({
        requestId: 'request-network',
        correlationId: 'corr-network',
        executionId: 'execution-network',
        requestType: 'chat',
        streaming: false,
        status: 'received',
        retryCount: 0,
        maxRetries: 0,
        currentStage: 'provider',
        stages: [],
        timestamp: new Date().toISOString(),
        startedAt: Date.now(),
        executionDurationMs: 0,
        headers: {},
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        metadata: {},
        customMetadata: {},
      }),
    ).rejects.toMatchObject({
      name: 'OpenAIProviderError',
      statusCode: 503,
      errorCode: 'OPENAI_NETWORK_ERROR',
      retryable: true,
    });
  });

  it('maps OpenAI provider status errors to sanitized codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { message: 'Invalid API key' },
    }), { status: 401, headers: { 'content-type': 'application/json' } })));

    await expect(
      new OpenAIAdapter().generate({
        requestId: 'request-auth',
        correlationId: 'corr-auth',
        executionId: 'execution-auth',
        requestType: 'chat',
        streaming: false,
        status: 'received',
        retryCount: 0,
        maxRetries: 0,
        currentStage: 'provider',
        stages: [],
        timestamp: new Date().toISOString(),
        startedAt: Date.now(),
        executionDurationMs: 0,
        headers: {},
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        metadata: {},
        customMetadata: {},
      }),
    ).rejects.toMatchObject({
      name: 'OpenAIProviderError',
      statusCode: 401,
      errorCode: 'OPENAI_AUTH_ERROR',
      retryable: false,
    });
  });

  it('validates invalid chat completion payloads before sending to OpenAI', async () => {
    const app = Fastify();
    app.setErrorHandler((error, _request, reply) => {
      if ((error as any).statusCode === 400 || (error as any).name === 'ValidationError') {
        return reply.status(400).send({
          success: false,
          message: 'Validation failed',
          data: null,
          error: { code: 'VALIDATION_ERROR' },
        });
      }
      return reply.status(400).send({ success: false, message: 'Bad Request', error: 'Bad Request' });
    });
    await app.register(openAiCompatibleRoutes, { prefix: '/v1' });

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 3,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toMatchObject({
      success: false,
      message: 'Validation failed',
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('returns an OpenAI-compatible chat completion payload for /v1/chat/completions', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 'chatcmpl-route',
      choices: [{ message: { content: 'Route response' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    const app = Fastify();
    await app.register(openAiCompatibleRoutes, { prefix: '/v1' });

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello from route' }],
        temperature: 0.2,
        max_tokens: 128,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(JSON.parse(response.payload)).toMatchObject({
      id: 'chatcmpl-route',
      object: 'chat.completion',
      model: 'gpt-4o-mini',
      choices: [{ message: { role: 'assistant', content: 'Route response' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    });
  });
});