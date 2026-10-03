# ORCHESTRA AI — Milestone 8

## Developer Experience & API Completeness

### Completed

- Added machine-readable `GET /openapi.json` generated from the live Fastify route registry.
- Retained Swagger UI at `/docs`.
- Added a dependency-free JavaScript SDK under `sdk/javascript`.
- Added a dependency-free Python SDK under `sdk/python`.
- Added a small Node CLI under `cli/orchestra.mjs` for models, provider status, metrics, and chat requests.
- Added JavaScript and Python quickstart examples.
- Added SDK/CLI documentation.

### Authentication boundary

These clients currently use the existing JWT access-token flow and optional `X-Project-ID`. Customer API keys remain intentionally deferred and are not fabricated by the SDK.

### Scope deliberately not started

- Anthropic/Gemini/Azure adapters
- Customer API-key rollout
- Billing/payments
- Advanced router
- Semantic cache
- Batch API
- IDE extensions
- Agent/RAG features

### Verification

From the backend:

```powershell
pnpm typecheck
pnpm test
pnpm --filter @orchestra/gateway build
```

After starting the gateway:

```powershell
curl.exe http://localhost:3001/openapi.json
curl.exe http://localhost:3001/docs
```

For the SDK examples, set `ORCHESTRA_ACCESS_TOKEN` and `ORCHESTRA_PROJECT_ID` for a real authenticated project.
