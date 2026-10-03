# ORCHESTRA-AI — Submission Demo Guide

## What this build provides

This submission runs without external AI-provider API keys when `DEMO_MODE=true`.

- OpenAI-compatible `POST /v1/chat/completions`
- OpenAI-compatible `GET /v1/models`
- Deterministic Demo Provider
- Streaming SSE responses
- Validation and security pipeline
- Provider routing
- Token usage and deterministic demo pricing
- Budget enforcement and spend tracking
- Request telemetry in PostgreSQL
- Metrics/history APIs
- Frontend Demo Mode indicator
- Gateway Try-It panel
- Request History backed by persisted telemetry
- Zero-data/empty-state handling

## Start backend

```bash
cd backend
pnpm install
pnpm db:generate
pnpm prisma migrate status --schema=prisma/schema.prisma
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Backend defaults to `http://localhost:3001`.

## Start frontend

From the repository root:

```bash
pnpm install
pnpm dev
```

Frontend defaults to the Vite development server.

## Demo environment

Backend `.env`:

```env
DEMO_MODE=true
DATABASE_URL=postgresql://orchestra:orchestra_secret@localhost:55433/orchestra_db?schema=public
```

Frontend `.env` for local development:

```env
VITE_DEMO_MODE=true
VITE_API_URL=http://localhost:3001
```

For a hosted frontend, set `VITE_API_URL` to the deployed gateway URL. If it is unavailable and `VITE_DEMO_MODE=true`, the frontend uses its built-in demo response and records a local demo-session event so Dashboard/History remain demonstrable.

## Demo request

```bash
curl -X POST http://localhost:3001/v1/chat/completions ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"orchestra-demo-model\",\"messages\":[{\"role\":\"user\",\"content\":\"Explain how ORCHESTRA AI works\"}]}"
```

## Demo streaming

```bash
curl -N -X POST http://localhost:3001/v1/chat/completions ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"orchestra-demo-model\",\"messages\":[{\"role\":\"user\",\"content\":\"Explain machine learning\"}],\"stream\":true}"
```

The response is emitted as multiple SSE chunks followed by `data: [DONE]`.

## Model discovery

```bash
curl http://localhost:3001/v1/models
```

## Evaluation flow

1. Open the dashboard.
2. Confirm the `DEMO MODE` indicator.
3. Open Gateway.
4. Use **Try AI Request**.
5. Send a prompt with streaming enabled.
6. Observe the streamed response.
7. Return to Dashboard and observe telemetry metrics.
8. Open Request History and verify the persisted request.
9. Inspect cost/token information.

## Intentionally deferred

This submission does not require:

- customer API-key issuance/rotation/revocation
- paid API access
- subscriptions
- Stripe/payment processing
- customer billing/invoicing
- real provider credentials

The real provider adapter architecture remains in the repository for later production integration.

## Verification note

The source was statically inspected in the build environment. Full dependency-based `pnpm test`, `pnpm typecheck`, and production builds require the project's dependencies plus PostgreSQL/Redis. The build environment used for this packaging pass had no pnpm installation, package registry access, Docker, or local PostgreSQL client.

## Windows startup / database verification

The backend `.env` uses PostgreSQL on host port `55433`. Before running `pnpm db:migrate` or `pnpm db:seed`, start the bundled services from `backend`:

```powershell
pnpm docker:up
```

Then verify PostgreSQL is reachable on `localhost:55433`. If `pnpm db:migrate` reports `P1001`, PostgreSQL is not running/reachable; this is an environment/service startup issue, not a Prisma schema failure.

Recommended order:

```powershell
pnpm install
pnpm docker:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm test
pnpm typecheck
pnpm build
```
