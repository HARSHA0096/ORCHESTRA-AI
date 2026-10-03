# Milestone 7 — Production Readiness

## Completed

- Pinned backend Docker build to pnpm 12.4.1.
- Removed the Docker dependency-install fallback so builds require the committed lockfile.
- Added production compose configuration with external PostgreSQL/Redis and no pgAdmin/database host exposure.
- Added production deployment and migration documentation.
- Added a separate Prisma production migration command/script.
- Fixed backend CI Docker build context so it builds from `backend/`.
- Added frontend CI build coverage.
- Documented `/live`, `/ready`, `/health`, and `/metrics` operational probes.
- Documented graceful shutdown and rollback requirements.
- Updated backend environment example for Vite port 8080 and `MAX_BODY_SIZE`.

## Intentionally not included

- Cloud-provider-specific infrastructure provisioning.
- Billing/payments.
- Customer API-key product work.
- New AI providers.
- Advanced routing.
- Kubernetes manifests.

Those require separate product/infrastructure decisions and are not silently assumed by this milestone.
