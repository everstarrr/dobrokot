FROM node:22-alpine AS base
# pnpm version is pinned in root package.json `packageManager`;
# corepack picks it up automatically when pnpm is invoked inside the project.
RUN corepack enable

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# `prisma generate` evaluates env("DATABASE_URL") from prisma.config.ts at load
# time; pass a placeholder so the generator runs (no DB connection is opened).
# The real DATABASE_URL is injected at runtime via .env.production / compose.
ENV DATABASE_URL="mysql://placeholder:placeholder@placeholder:3306/placeholder"
RUN pnpm --filter @dobrokot/api db:generate
RUN pnpm --filter @dobrokot/api build

# --- Runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/
COPY --from=builder /app/apps/api/package.json ./apps/api/
# pnpm installs devDeps (incl. `prisma` CLI) into the workspace package's own
# node_modules; the runner needs it to run `prisma migrate deploy`.
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER api

EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
