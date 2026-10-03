#!/usr/bin/env node
const baseUrl = (process.env.ORCHESTRA_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const token = process.env.ORCHESTRA_ACCESS_TOKEN;
const projectId = process.env.ORCHESTRA_PROJECT_ID;
const [command, ...args] = process.argv.slice(2);

async function call(path, options = {}) {
  const headers = { accept: 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(projectId ? { 'x-project-id': projectId } : {}), ...(options.body ? { 'content-type': 'application/json' } : {}) };
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined });
  const text = await response.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) { console.error(JSON.stringify(data, null, 2)); process.exit(1); }
  console.log(JSON.stringify(data, null, 2));
}

if (command === 'models') await call('/v1/models');
else if (command === 'status') await call('/api/v1/gateway/provider-health');
else if (command === 'metrics') await call(`/api/v1/metrics${args[0] ? `?${args[0].replace(/^\?/, '')}` : ''}`);
else if (command === 'chat') {
  const modelIndex = args.indexOf('--model');
  const model = modelIndex >= 0 ? args[modelIndex + 1] : 'gpt-4o-mini';
  const prompt = args.filter((arg, i) => i !== modelIndex && i !== modelIndex + 1).join(' ') || 'Hello from ORCHESTRA';
  await call('/v1/chat/completions', { method: 'POST', body: { model, messages: [{ role: 'user', content: prompt }] } });
} else {
  console.log('Usage: orchestra <models|status|metrics|chat> [options]');
}
