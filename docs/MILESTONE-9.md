# ORCHESTRA AI — Milestone 9

## Final Production QA & Release Certification

### Release-gate fixes completed

- Backend workspace packages now have explicit `build` scripts and publish runtime entrypoints from `dist`.
- Package `types` remain source-based so the existing pre-build TypeScript checks continue to resolve workspace types.
- Backend CI now pins pnpm to `12.4.1`, matching the repository toolchain.
- Customer API-key demo generation was removed from the frontend release surface because customer API-key rollout is intentionally deferred.
- The API-key page now clearly communicates the deferred status instead of generating fake credentials.
- Production Docker continues to run with `DEMO_MODE=false`.
- Secret-material scan found no private keys or obvious provider API-key literals in the submission tree.

### Static verification completed

- Package JSON validation: PASS
- YAML validation for CI/production Compose: PASS
- JavaScript syntax (`node --check`): PASS
- Python SDK syntax: PASS
- Fake credential generation scan: PASS
- No `.env` secrets shipped; only `.env.example` is present.

### Environment-dependent verification

These must be executed in an environment with network access and Docker:

```powershell
cd backend
pnpm install --frozen-lockfile
pnpm db:generate
pnpm typecheck
pnpm test
pnpm build
```

Frontend:

```powershell
pnpm install --frozen-lockfile
pnpm build
```

Production container:

```powershell
cd backend
docker build -f docker/Dockerfile -t orchestra-ai-gateway:release .
```

Runtime smoke test:

```powershell
curl.exe http://localhost:3001/live
curl.exe http://localhost:3001/ready
curl.exe http://localhost:3001/health
curl.exe http://localhost:3001/openapi.json
curl.exe http://localhost:3001/metrics
```

### Certification status

**Release Candidate — pending environment-dependent build/runtime verification.**

The source package has passed the static release gates available in the build sandbox. A final production certification must not claim Docker/runtime success until the commands above pass on the target environment or CI runner.
