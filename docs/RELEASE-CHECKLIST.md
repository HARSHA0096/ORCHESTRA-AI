# ORCHESTRA AI Release Checklist

## 1. Backend

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm db:generate`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm lint`

## 2. Frontend

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm build`
- [ ] Open the deployed/local dashboard and verify no console errors.

## 3. Database / runtime

- [ ] PostgreSQL reachable
- [ ] Redis reachable
- [ ] Prisma migrations applied
- [ ] `/live` returns 200
- [ ] `/ready` returns 200 when dependencies are healthy
- [ ] `/health` reports healthy dependencies
- [ ] `/openapi.json` returns OpenAPI JSON
- [ ] `/docs` loads Swagger UI
- [ ] `/metrics` returns Prometheus text

## 4. Demo Mode

- [ ] Local submission uses `DEMO_MODE=true`
- [ ] No external provider key is required for demo mode
- [ ] Demo request persists telemetry
- [ ] Dashboard/history show persisted demo activity

## 5. Production safety

- [ ] Production uses `DEMO_MODE=false`
- [ ] Provider credentials come from the deployment secret store
- [ ] JWT secrets are replaced with strong deployment secrets
- [ ] `API_KEY_SALT` is replaced with a strong deployment secret
- [ ] `CORS_ORIGINS` is restricted to trusted frontend origins
- [ ] No `.env` or private-key material is committed
- [ ] Customer API-key rollout remains explicitly deferred

## 6. Container

- [ ] Docker build succeeds
- [ ] Container starts as non-root `orchestra` user
- [ ] Container healthcheck passes
- [ ] `/live` is reachable inside the container
- [ ] Production database migration is run separately with `migrate-production.sh`

## Release decision

Only mark the release **CERTIFIED** after all environment-dependent boxes above pass in CI or the target deployment environment.
