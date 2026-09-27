# Orchestra AI implementation requirements

This document is the completion plan for the Orchestra AI workflow. The repository contains a Vite/TanStack Start frontend and a Fastify/Prisma/Redis backend. The product must display only persisted or live records. Empty, loading, and error states are valid; fabricated counters, provider names, logs, requests, costs, alerts, identities, and sessions are not valid production data.

## 1. Target workflow

The completed request path is:

```text
Client application
  -> API key or user authentication
  -> Fastify gateway
  -> request validation and organization authorization
  -> security policy checks
  -> budget and quota checks
  -> model selection and provider adapter
  -> retry/fallback policy
  -> provider API
  -> normalized response
  -> telemetry, cost, audit, and notification events
  -> dashboard APIs and WebSocket updates
```

The dashboard is an observer and administrator of this workflow. It must not invent operational data in the browser.

## 2. Completion phases
Implement the project in this order:

1. **Foundation**
	- Use Node.js 22+ and pnpm 9+.
	- Install frontend and backend workspaces from their respective roots.
	- Approve required pnpm build scripts in a reviewed environment.
	- Keep `.env` files local and out of source control.

2. **Infrastructure**
	- Start PostgreSQL 16 and Redis 7 with `backend/docker/docker-compose.yml`.
	- Create `backend/.env` from `backend/.env.example`.
	- Run Prisma generation and database migrations.
	- Seed only reference data required for development, never fake telemetry.

3. **Backend platform**
	- Complete configuration validation in `backend/packages/config`.
	- Complete database repositories and soft-delete behavior.
	- Complete JWT sessions, Argon2 passwords, API-key hashing, RBAC, and organization resolution.
	- Apply request IDs, correlation IDs, CORS, Helmet, rate limits, validation, and structured logging to every route.

4. **Provider gateway**
	- Implement one provider adapter end to end first.
	- Normalize provider requests and responses into one internal contract.
	- Add model capability and pricing metadata.
	- Add timeout, retry, circuit breaker, fallback, and provider health behavior.
	- Add additional providers only after the first adapter passes integration tests.

5. **Telemetry and policy**
	- Persist request, token, cost, security, recovery, audit, and notification events.
	- Enforce security and budget policies before provider calls.
	- Publish normalized events to Redis/BullMQ/WebSocket channels where appropriate.
	- Make event retention, privacy, and aggregation rules explicit.

6. **Frontend integration**
	- Replace route-local state with authenticated API queries and mutations.
	- Add loading, empty, error, retry, unauthorized, and forbidden states.
	- Scope every query by the active organization and project.
	- Never send provider credentials or secret API keys to browser code.

7. **Verification and deployment**
	- Run frontend build, backend build, lint, unit tests, integration tests, and migration checks.
	- Preview the Nitro output using the supported runtime target.
	- Deploy the SSR server and static assets together; do not treat `.output/public` as a complete SSR deployment by itself.
	- Configure production secrets, database, Redis, domains, CORS, logging, backups, and rollback before release.

## 3. Required runtime services

- PostgreSQL for application records, configuration, audit data, and durable telemetry.
- Redis for sessions, queues, rate limits, locks, cache, and short-lived live telemetry.
- Fastify gateway reachable from the frontend and client applications.
- A secret manager or deployment environment for credentials.
- One or more supported AI provider APIs, or a reachable self-hosted model endpoint.
- Optional object storage for large prompts, traces, exports, or documents. Do not store large payloads directly in ordinary log rows.

## 4. Environment requirements

The backend environment must define, validate, and document at least:

```env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<32+ random characters>
JWT_REFRESH_SECRET=<32+ random characters>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
API_KEY_SALT=<16+ random characters>
CORS_ORIGINS=http://localhost:5173
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
QUEUE_PREFIX=orchestra
```

Provider secrets belong only in the backend deployment environment or secret manager. Add provider variables only with a matching adapter and schema validation, for example:

```env
OPENAI_API_KEY=<secret>
ANTHROPIC_API_KEY=<secret>
GOOGLE_AI_API_KEY=<secret>
MISTRAL_API_KEY=<secret>
```

Use placeholders in `.env.example`. Never commit real values, print them in logs, or return them from an API.

## 5. Core data model

- **User**: id, email, password hash, name, role, status, verification state, last login, timestamps.
- **Organization**: id, name, slug, plan, status, settings, timestamps.
- **Membership**: user id, organization id, role, status, invitation and join timestamps.
- **Project**: id, organization id, name, slug, environment, status, metadata, timestamps.
- **Project membership**: user id, project id, role, timestamps.
- **API key**: id, project id, hash, prefix, scopes, status, expiry, last-used timestamp, creator. Return the full key only once at creation.
- **Provider**: id, type, display name, base URL, status, secret reference, capabilities.
- **Provider model**: provider id, model id, display name, context window, capabilities, input/output prices, status.
- **Request event**: id, project id, provider id, model id, status, timestamps, latency, input/output tokens, cost, trace and correlation IDs.
- **Security event**: id, request id, category, severity, source, action, policy id, timestamp.
- **Recovery event**: id, request id, failure reason, fallback provider/model, attempts, duration, outcome.
- **Budget**: project id, period, limit, current spend, currency, alert thresholds.
- **Audit log**: actor, organization, project, action, resource, before/after metadata, request ID, timestamp.
- **Notification**: id, organization/user id, category, severity, title, body, read state, timestamp.
- **Configuration**: organization/project/provider policy values with version and audit history.

All tenant-owned records require organization scoping. Use UUIDs, timestamps, indexes for lookup fields, soft-delete where defined by the schema, and explicit retention rules for telemetry.

## 6. Backend API contract

Every endpoint must return a consistent envelope containing `success`, `data`, `message`, `requestId`, and `timestamp`. Paginated responses must include `page`, `perPage`, `total`, `totalPages`, `hasNext`, and `hasPrevious`, or use a documented cursor contract.

Required endpoint groups:

- `POST /api/v1/auth/register`, `POST /login`, `POST /refresh`, `POST /logout`.
- `GET/PATCH /api/v1/me` and session management endpoints.
- `GET/POST/PATCH/DELETE /api/v1/organizations` and membership/invitation endpoints.
- `GET/POST/PATCH/DELETE /api/v1/projects` with organization authorization.
- `GET/POST/DELETE /api/v1/api-keys`; hash keys at rest and show the raw key once.
- `GET/POST/PATCH/DELETE /api/v1/providers` without exposing provider secrets.
- `GET/POST/PATCH /api/v1/provider-models` with pricing and capabilities.
- `POST /api/v1/gateway/chat` or an OpenAI-compatible gateway endpoint.
- `GET /api/v1/metrics` with time range and project filters.
- `GET /api/v1/history` with pagination and status/provider/model filters.
- `GET /api/v1/observability` for logs, traces, latency series, and correlation IDs.
- `GET /api/v1/security` for threat events and policy state.
- `GET /api/v1/recovery` for failover events and playbook state.
- `GET/PATCH /api/v1/notifications` for organization-scoped alerts.
- `GET /health`, `GET /health/ready`, and `GET /docs` for operations.

Every endpoint needs authentication where applicable, tenant authorization, Zod validation, pagination limits, rate limiting, audit logging for mutations, and explicit 401/403/404/409/422/429/500 responses.

## 7. Provider and LLM requirements

For each provider adapter define:

- authentication method and secret reference;
- base URL and region;
- supported models and capabilities;
- input/output token pricing and currency;
- timeout and retry policy;
- streaming behavior;
- provider error normalization;
- health-check behavior;
- privacy and data-retention terms;
- fallback priority and circuit-breaker thresholds.

The gateway must record usage and cost from provider responses, not estimate fake values. Redact prompts and outputs by default; store content only when an explicit policy permits it.

## 8. Frontend requirements

The frontend must:

- authenticate through the backend, not directly with provider APIs;
- use query/mutation clients for server state;
- scope requests by organization and project;
- render real metrics from API responses;
- show loading, empty, error, unauthorized, and forbidden states;
- support pagination and filters without loading unbounded telemetry;
- never persist raw provider secrets in local storage;
- display timestamps with timezone handling;
- expose request IDs when reporting failures;
- disable actions when the user lacks the required role;
- keep exports tied to the same authorization and filters as the screen.

## 9. Security and privacy gates

- Hash passwords with Argon2 and API keys with a one-way hash plus salt.
- Rotate JWT secrets and provider secrets through the deployment secret manager.
- Enforce RBAC and tenant isolation in service/repository queries, not only in the UI.
- Redact authorization headers, API keys, passwords, prompts, and sensitive response content from logs.
- Validate and bound request body size, prompt size, page size, and export size.
- Add prompt injection, PII, unsafe output, allowlist, and rate policies as versioned configuration.
- Add audit events for authentication, key creation/revocation, policy changes, provider changes, and exports.
- Define telemetry retention and deletion procedures.
- Run dependency, secret, and container scans in CI.

## 10. Testing requirements

- Unit tests for schemas, pagination, cost calculation, token accounting, policy evaluation, and key hashing.
- Repository tests against PostgreSQL for tenant scoping, soft delete, uniqueness, and transactions.
- Redis tests for sessions, rate limits, locks, cache, and queue behavior.
- Gateway integration tests for auth, RBAC, validation, provider errors, retries, fallback, and streaming.
- Frontend tests for loading, empty, error, pagination, unauthorized, and mutation states.
- End-to-end tests for register -> create organization -> create project -> configure provider -> issue key -> send request -> view telemetry.
- Security tests for cross-tenant access, secret leakage, replayed tokens, injection payloads, and rate limits.
- Migration tests from a clean database and from the previous production version.

## 11. Local workflow

From the repository root:

```powershell
npm install
npm run build
npm run dev
```

For the backend:

```powershell
cd backend
Copy-Item .env.example .env
pnpm docker:up
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Use the backend API at `http://localhost:3001`, Swagger at `http://localhost:3001/docs`, and the frontend at the Vite URL shown by `npm run dev`. Do not claim the full workflow works until PostgreSQL, Redis, the gateway, and at least one provider adapter are running.

## 12. Deployment requirements

- Build the frontend and backend with pinned Node/pnpm versions.
- Run migrations as a controlled release step, never automatically on every web instance startup.
- Deploy the Nitro SSR server and public assets to a compatible runtime together.
- Configure production `DATABASE_URL`, `REDIS_URL`, CORS origins, JWT secrets, provider secrets, logging, and rate limits.
- Configure health checks and readiness checks before accepting traffic.
- Enable database backups, Redis recovery expectations, log retention, alerting, and rollback.
- Use preview environments with isolated credentials and databases.
- Verify direct navigation and refresh for every frontend route after deployment.

## 13. Acceptance criteria

The project is complete when:

- frontend and backend builds pass in a clean install;
- Prisma generation and migrations work from a clean database;
- gateway health and readiness checks are green;
- a user can authenticate and is isolated to their organization;
- a project and API key can be created, used once, revoked, and audited;
- one provider can receive a request through the gateway and return a normalized response;
- timeout, rate-limit, provider-error, and fallback behavior are tested;
- request, cost, security, recovery, audit, and notification data is persisted;
- every dashboard page is driven by API data and has honest empty/error states;
- no production screen contains fabricated business data;
- secrets do not appear in browser bundles, logs, responses, or version control;
- deployment serves SSR routes and direct route refreshes correctly;
- monitoring and rollback procedures are documented and tested.

## 14. Is LLM training required?

No. Orchestra AI is an orchestration, routing, security, cost, and observability platform. Running it requires model API access, provider/model metadata, policy configuration, and telemetry. It does not require training or fine-tuning an LLM.

Use retrieval-augmented generation when the system must answer from private documents. Consider fine-tuning only after measured evaluation shows that prompting, structured outputs, retrieval, or provider selection cannot meet a specific quality requirement. Training data, evaluation data, privacy review, cost, and model-version rollback are required before any fine-tuning project.
