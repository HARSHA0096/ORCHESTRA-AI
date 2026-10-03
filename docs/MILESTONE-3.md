# ORCHESTRA-AI — Milestone 3

## Scope

Milestone 3 adds real, authenticated, project-scoped read APIs over persisted telemetry. It does not modify the frontend or start Milestone 4.

## Endpoints

- `GET /api/v1/metrics`
- `GET /api/v1/history`
- `GET /api/v1/observability`
- `GET /api/v1/security`
- `GET /api/v1/recovery`
- `GET /api/v1/projects/:projectId/budget`
- `PATCH /api/v1/projects/:projectId/budget`

All endpoints require JWT authentication and an explicit project context. Project access is checked through project membership or organization-admin membership.

## Data policy

All results come from PostgreSQL telemetry/budget records. Empty databases return zero/empty/null values rather than fabricated data. No prompt, message, response body, or API key is returned by these telemetry APIs.

## Deferred

Frontend integration, customer API-key authentication, new providers, payments/billing, and later milestones remain unchanged.
