# Orchestra AI — Backend Architecture

## Overview

Orchestra AI is an Enterprise AI Middleware Platform. The backend sits between client applications and AI providers, handling authentication, routing, cost intelligence, security, and observability.

## Monorepo Structure

```
backend/
├── apps/gateway/          # Fastify API server (entry point)
├── packages/
│   ├── config/            # Zod-validated environment configuration
│   ├── database/          # Prisma client wrapper with soft-delete middleware
│   ├── redis/             # ioredis client with reconnection
│   ├── logger/            # Pino logger with redaction
│   ├── queue/             # BullMQ queue infrastructure
│   ├── auth/              # JWT (jsonwebtoken), Argon2 password hashing, API key generation
│   ├── errors/            # AppError base class + HTTP error subclasses
│   ├── validation/        # Shared Zod schemas for all domains
│   ├── middleware/         # Reusable Fastify preHandler hooks
│   ├── shared/            # Types, utilities, constants
│   └── events/            # Typed event bus (EventEmitter-based)
├── prisma/                # Schema + migrations + seed
├── docker/                # Dockerfile + docker-compose
├── scripts/               # Shell scripts for setup/migrate/seed
└── .github/workflows/     # CI pipeline
```

## Domain-Driven Design

Each domain follows the **Controller → Service → Repository** pattern:

| Domain | Responsibility |
|---|---|
| Identity | User auth: register, login, logout, refresh, sessions |
| Organizations | Multi-tenant org management, members, invitations |
| Projects | Project CRUD within orgs, archive, duplicate |
| API Keys | Generate, rotate, revoke — hash-only storage |
| Providers | AI provider registry (stub for future routing) |
| Audit | Immutable audit log entries |
| Notifications | User notifications (stub for future queue integration) |

## Request Flow

```
Client Request
  ↓ Fastify receives
  ↓ Helmet (security headers)
  ↓ CORS
  ↓ Rate Limiter
  ↓ Request ID + Correlation ID
  ↓ Request Logger
  ↓ Authentication (JWT / API Key)
  ↓ Authorization (RBAC)
  ↓ Validation (Zod)
  ↓ Organization Resolver
  ↓ Controller → Service → Repository
  ↓ Consistent API Response
Client Response
```

## Technology Stack

- **Runtime**: Node.js 22+ / TypeScript (strict mode)
- **Framework**: Fastify 5 with plugin architecture
- **Database**: PostgreSQL 16 via Prisma ORM (14 models)
- **Cache**: Redis 7 via ioredis
- **Auth**: JWT + Argon2 + API Key hashing (SHA-256)
- **Validation**: Zod
- **Logging**: Pino with redaction
- **Queue**: BullMQ (infrastructure ready)
- **WebSocket**: Socket.IO (foundation ready)
- **Containerization**: Docker + Docker Compose
- **CI**: GitHub Actions

## Database Schema

14 models: User, Organization, OrgMembership, Project, ProjectMember, ApiKey, Provider, ProviderModel, Session, Role, Permission, RolePermission, AuditLog, Notification, Configuration.

All models include UUID primary keys, timestamps, and soft-delete (where applicable).

## Future Phases

- Security Engine (WAF, input sanitization, threat detection)
- Cost Intelligence Engine (usage tracking, budget enforcement)
- Model Router (smart routing across providers)
- Self-Healing (automatic failover, circuit breaking)
- Observability (metrics, tracing, dashboards)
