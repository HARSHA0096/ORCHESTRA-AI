# ORCHESTRA-AI — Milestone 2

## Scope

Milestone 2 makes the gateway execution path real for the first production provider while keeping the existing provider abstraction intact.

## Completed

- OpenAI adapter performs real native `fetch` requests for chat completions.
- OpenAI SSE streaming is implemented and parsed incrementally.
- OpenAI streaming requests request final usage metadata and preserve it through `StreamChunk` into the provider response.
- OpenAI provider errors are mapped to typed, sanitized retryable/non-retryable errors.
- OpenAI health checks call the provider `/v1/models` endpoint instead of returning a hardcoded health value.
- Cost stage calculates estimated request cost from persisted provider/model pricing and enforces an existing project budget before provider execution.
- Observability persists `RequestEvent` rows with request/correlation IDs, project/provider/model, status, latency, token usage and cost.
- Prompt/message/response/API-key content is not persisted in request telemetry.
- Security stage performs request-size, basic prompt-injection and PII checks and persists triggered `SecurityEvent` rows.
- Security-policy and budget failures are explicitly non-retryable.
- Retry engine retries only errors explicitly marked retryable, using exponential backoff with jitter.
- Retry engine supports persisted `RecoveryEvent` records when an actual fallback callback is supplied.
- Other provider adapters remain unchanged stubs by design; their real integrations are outside this milestone.

## Explicitly deferred

- Customer API-key authentication
- Anthropic/Gemini/Azure/other real provider integrations
- Customer billing/subscriptions/payments
- Frontend changes
- Metrics/history/read APIs
- Advanced routing and automatic fallback policy selection

## Verification

Run from `backend` after installing dependencies and starting PostgreSQL/Redis:

```powershell
pnpm --filter @orchestra/gateway build
pnpm test
pnpm typecheck
pnpm prisma migrate status --schema=prisma/schema.prisma
git diff --check
```

A real OpenAI request additionally requires `OPENAI_API_KEY` in the backend environment. Demo Mode remains available for local/submission verification without an external provider key.
