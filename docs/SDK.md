# ORCHESTRA SDKs and CLI

Milestone 8 adds lightweight developer clients without introducing a customer API-key system. Current clients authenticate with the existing JWT access token and optional `X-Project-ID` context.

## JavaScript

```js
import { OrchestraClient } from '@orchestra-ai/sdk';

const client = new OrchestraClient({
  baseUrl: process.env.ORCHESTRA_BASE_URL,
  accessToken: process.env.ORCHESTRA_ACCESS_TOKEN,
  projectId: process.env.ORCHESTRA_PROJECT_ID,
});

const result = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello' }],
});
```

The SDK also exposes `models()`, `metrics()`, `history()`, `observability()`, `security()`, `recovery()`, and `providerHealth()`.

## Python

```python
from orchestra import OrchestraClient

client = OrchestraClient(
    base_url="http://localhost:3001",
    access_token="YOUR_ACCESS_TOKEN",
    project_id="YOUR_PROJECT_ID",
)

result = client.chat_completion(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello"}],
)
```

## CLI

```bash
ORCHESTRA_ACCESS_TOKEN=... ORCHESTRA_PROJECT_ID=... node cli/orchestra.mjs models
ORCHESTRA_ACCESS_TOKEN=... ORCHESTRA_PROJECT_ID=... node cli/orchestra.mjs status
ORCHESTRA_ACCESS_TOKEN=... ORCHESTRA_PROJECT_ID=... node cli/orchestra.mjs chat --model gpt-4o-mini "Hello"
```

## OpenAPI

The gateway serves Swagger UI at `/docs` and exports the generated OpenAPI document at `/openapi.json`.

The OpenAPI document is generated from the same Fastify route registration used by the running service; it is not a separately maintained hand-written copy.
