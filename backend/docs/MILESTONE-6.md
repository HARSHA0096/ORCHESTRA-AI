# Milestone 6 — Observability & Operations

## Scope
- Prometheus-compatible process/request metrics at `GET /metrics`.
- Response correlation headers preserved on every request.
- Provider health endpoint at `GET /api/v1/gateway/provider-health` (JWT protected).
- Existing persisted telemetry, audit logs, health/readiness/liveness probes remain the source of project and system history.

## Metrics boundary
`/metrics` contains process-local operational counters only. It does not expose prompts, messages, API keys, or customer telemetry. Project telemetry remains project-scoped behind authenticated endpoints.

## Verification
- `pnpm test`
- `pnpm typecheck`
- `pnpm --filter @orchestra/gateway build`
- `pnpm prisma migrate status --schema=prisma/schema.prisma`
- `git diff --check`
