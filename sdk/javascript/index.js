export class OrchestraError extends Error {
  constructor(message, { status, requestId, code, details } = {}) {
    super(message);
    this.name = 'OrchestraError';
    this.status = status;
    this.requestId = requestId;
    this.code = code;
    this.details = details;
  }
}

export class OrchestraClient {
  constructor({ baseUrl = 'http://localhost:3001', accessToken, projectId, fetchImpl = globalThis.fetch } = {}) {
    if (!fetchImpl) throw new Error('A fetch implementation is required');
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
    this.projectId = projectId;
    this.fetch = fetchImpl;
  }

  async request(path, { method = 'GET', body, headers = {}, signal } = {}) {
    const response = await this.fetch(`${this.baseUrl}${path}`, {
      method,
      signal,
      headers: {
        accept: 'application/json',
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(this.accessToken ? { authorization: `Bearer ${this.accessToken}` } : {}),
        ...(this.projectId ? { 'x-project-id': this.projectId } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!response.ok) {
      const error = data?.error ?? {};
      throw new OrchestraError(data?.message ?? `ORCHESTRA request failed (${response.status})`, {
        status: response.status,
        requestId: data?.requestId ?? response.headers.get('x-request-id') ?? undefined,
        code: error.code,
        details: error.details,
      });
    }
    return data;
  }

  chat = {
    completions: {
      create: (body, options = {}) => this.request('/v1/chat/completions', { method: 'POST', body, ...options }),
    },
  };

  models() { return this.request('/v1/models'); }
  metrics(query = '') { return this.request(`/api/v1/metrics${query ? `?${query.replace(/^\?/, '')}` : ''}`); }
  history(query = '') { return this.request(`/api/v1/history${query ? `?${query.replace(/^\?/, '')}` : ''}`); }
  observability(query = '') { return this.request(`/api/v1/observability${query ? `?${query.replace(/^\?/, '')}` : ''}`); }
  security(query = '') { return this.request(`/api/v1/security${query ? `?${query.replace(/^\?/, '')}` : ''}`); }
  recovery(query = '') { return this.request(`/api/v1/recovery${query ? `?${query.replace(/^\?/, '')}` : ''}`); }
  providerHealth() { return this.request('/api/v1/gateway/provider-health'); }
}
