# Docker

This repository has two Docker entry points:

- `docker-compose.yml` for local infrastructure and local container runs
- `docker-compose.prod.yml` for production deployment

This document covers both ways to run the project:

- development mode with hot reload
- production mode with Docker Compose

## Files

- `docker-compose.yml` - local MySQL, Redis, API, and Web stack
- `docker-compose.prod.yml` - production stack
- `.env.example` - local environment template
- `.env.production.example` - production environment template
- `apps/api/Dockerfile` - production image for the backend
- `apps/web/Dockerfile` - production image for the frontend

## Development

The recommended development flow is:

1. Run MySQL and Redis in Docker
2. Run `api` and `web` locally with `pnpm dev`

This gives you hot reload and matches the project scripts.

### 1. Create `.env`

On macOS/Linux:

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

The default local values are already set for:

- frontend: `http://localhost:3000`
- backend: `http://localhost:4000`
- MySQL: `localhost:3306`
- Redis: `localhost:6379`

### 2. Start local infrastructure in Docker

```bash
docker compose up -d mysql redis
```

Check status:

```bash
docker compose ps
docker compose logs -f mysql redis
```

### 3. Install dependencies and prepare the database

```bash
pnpm install
pnpm db:generate
pnpm db:push
```

### 4. Start the app in dev mode

```bash
pnpm dev
```

After startup:

- `http://localhost:3000` - web
- `http://localhost:4000/health` - backend healthcheck
- `http://localhost:4000/api` - backend API base

### 5. Stop local infrastructure

```bash
docker compose down
```

If you also want to remove Docker volumes:

```bash
docker compose down -v
```

## Local Full Stack in Docker

If you want to run the full stack locally in containers:

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f
```

Important:

- the current `docker-compose.yml` runs `api` and `web` with production runtime containers
- this is useful for local smoke testing
- this does not provide hot reload like `pnpm dev`

After the first startup, initialize Prisma inside the API container:

```bash
docker compose exec api pnpm --filter @dobrokot/api db:generate
docker compose exec api pnpm --filter @dobrokot/api db:push
```

## Production

Production runs through `docker-compose.prod.yml` and `.env.production`.

### 1. Create `.env.production`

On macOS/Linux:

```bash
cp .env.production.example .env.production
```

On PowerShell:

```powershell
Copy-Item .env.production.example .env.production
```

Then replace all placeholder values.

At minimum, check these variables:

- `PUBLIC_APP_URL` - public frontend URL, for example `https://dobrokot.ru`
- `PUBLIC_API_URL` - public API URL, for example `https://api.dobrokot.ru/api`
- `NEXT_PUBLIC_API_URL` - must match `PUBLIC_API_URL`
- `CORS_ORIGIN` - must match `PUBLIC_APP_URL`
- `NEXTAUTH_URL` - must match `PUBLIC_APP_URL`
- `MYSQL_ROOT_PASSWORD`, `DATABASE_PASSWORD`, `JWT_SECRET`, `NEXTAUTH_SECRET`, and `SMTP_PASS` must be real secrets

Important:

- do not use `http://api:4000/api` as `NEXT_PUBLIC_API_URL` in production
- the browser must reach the API through a real public URL

### 2. Build and start the production stack

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Check status:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
```

### 3. Initialize Prisma

After the containers are up:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec api pnpm --filter @dobrokot/api db:generate
docker compose --env-file .env.production -f docker-compose.prod.yml exec api pnpm --filter @dobrokot/api db:push
```

If the project later switches to strict versioned migrations, replace `db:push` with the migration command used by the team.

### 4. Put a reverse proxy in front

For a real production deployment, put Nginx or Caddy in front of the containers:

- forward frontend traffic to `http://127.0.0.1:3000`
- forward API traffic to `http://127.0.0.1:4000`

Minimum production requirements:

- HTTPS
- correct public domains for frontend and API
- proxy headers forwarded correctly

### 5. Verify the deployment

Check:

- `https://your-app-domain/`
- `https://your-api-domain/health`

Also verify:

- donor search works
- the map page loads
- the frontend can reach the API
- authentication works
- email sending works if SMTP is configured

## Updating Production

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

If the Prisma schema changed:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec api pnpm --filter @dobrokot/api db:push
```
