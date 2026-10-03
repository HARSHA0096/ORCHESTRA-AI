# ORCHESTRA-AI Production Deployment

## Scope

This guide covers the production-ready backend image and runtime introduced in Milestone 7. It does not provision cloud infrastructure or managed PostgreSQL/Redis for you.

## Required production services

- PostgreSQL 16+
- Redis 7+
- HTTPS reverse proxy/load balancer
- ORCHESTRA gateway container

PostgreSQL and Redis should be managed services in a real production environment rather than exposed directly from the application host.

## Required secrets

Set these through the deployment platform's secret manager, not Git:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `API_KEY_SALT`
- `CORS_ORIGINS`
- provider keys such as `OPENAI_API_KEY` only when that provider is enabled

Production configuration rejects placeholder JWT/API-key secrets, Demo Mode, wildcard CORS, and localhost CORS origins.

## Build

From `backend/`:

```bash
docker build -f docker/Dockerfile -t orchestra-ai-gateway:latest .
```

The Docker build uses a pinned pnpm version and a frozen lockfile. A dependency-resolution fallback is intentionally not used.

## Database migration

Run migrations as a separate deployment step before routing traffic to a new application version:

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

The production image contains the Prisma schema and CLI dependencies required for this migration step.

Do not use `prisma migrate dev` against production.

## Runtime

The production compose file is:

```bash
docker compose -f docker/docker-compose.production.yml up -d
```

It deliberately does not expose PostgreSQL, Redis, or pgAdmin. Supply their connection URLs through the environment/secret manager.

## Health probes

- `/live` — process liveness; does not require dependencies.
- `/ready` — readiness; returns `503` when required dependencies are unavailable.
- `/health` — dependency health and latency details.
- `/metrics` — process/infrastructure metrics for a scraper.

A load balancer should use `/live` for liveness and `/ready` for traffic readiness.

## Shutdown

The gateway handles `SIGTERM`/`SIGINT` by:

1. stopping new Fastify connections;
2. waiting for in-flight requests to finish;
3. closing WebSocket connections;
4. disconnecting PostgreSQL;
5. disconnecting Redis.

The container has a 30-second stop grace period to allow this sequence to complete.

## Deployment sequence

1. Build and scan the image.
2. Run Prisma migrations as a separate job.
3. Start the new gateway instance.
4. Wait for `/ready` to return HTTP 200.
5. Shift traffic to the new instance.
6. Keep the previous version available for rollback until the new version is healthy.

## Rollback

Application rollback should use the previous immutable image. Database migrations must be backward-compatible with the application versions that may run during rollback.

## Frontend

The frontend remains deployable to Vercel. Set:

```text
VITE_BACKEND_URL=https://<your-api-domain>
VITE_DEMO_MODE=false
```

Do not point a production frontend at `localhost`.

## Release packaging note

All backend workspace packages now expose a compiled `dist` runtime entrypoint and a `build` script. The gateway production image is therefore built from the same workspace package graph used by CI rather than relying on runtime TypeScript source loading.
