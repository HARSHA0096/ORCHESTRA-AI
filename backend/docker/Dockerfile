FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.4.1 --activate
WORKDIR /app

# ── Install dependencies ──
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/gateway/package.json apps/gateway/
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
COPY packages/redis/package.json packages/redis/
COPY packages/logger/package.json packages/logger/
COPY packages/queue/package.json packages/queue/
COPY packages/auth/package.json packages/auth/
COPY packages/errors/package.json packages/errors/
COPY packages/validation/package.json packages/validation/
COPY packages/middleware/package.json packages/middleware/
COPY packages/shared/package.json packages/shared/
COPY packages/events/package.json packages/events/
RUN pnpm install --frozen-lockfile

# ── Build ──
FROM deps AS build
COPY . .
RUN npx prisma generate --schema=prisma/schema.prisma
RUN pnpm -r build

# ── Production ──
FROM node:22-alpine AS production
RUN addgroup -S orchestra && adduser -S orchestra -G orchestra
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/gateway/dist ./apps/gateway/dist
COPY --from=build /app/apps/gateway/package.json ./apps/gateway/
COPY --from=build /app/packages ./packages
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./

# Keep the production image deterministic: dependencies were resolved from the lockfile in the build stage.

USER orchestra
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/live || exit 1

CMD ["node", "apps/gateway/dist/server.js"]
