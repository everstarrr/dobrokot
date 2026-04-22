# Deploy DoBroKot to production

This repository is ready to deploy with Docker Compose in production mode.

## What is included

- `docker-compose.prod.yml` for a production stack
- `.env.production.example` as a template for required environment variables
- Docker images for `web` and `api` aligned to `pnpm@10.33.0`

## Recommended server

- Ubuntu 22.04+ or Debian 12+
- 2 vCPU
- 4 GB RAM
- 30+ GB SSD
- Docker Engine + Docker Compose plugin installed

## 1. Prepare the server

Clone the repository on the server:

```bash
git clone <your-repo-url> dobrokot
cd dobrokot
```

Copy the production env template:

```bash
cp .env.production.example .env.production
```

Then edit `.env.production` and replace every placeholder secret and URL.

Important:

- `PUBLIC_APP_URL` must be the real public URL of the frontend, for example `https://dobrokot.ru`
- `PUBLIC_API_URL` must be the real public URL of the API, for example `https://api.dobrokot.ru/api`
- `NEXT_PUBLIC_API_URL` must match `PUBLIC_API_URL`
- `CORS_ORIGIN` must match `PUBLIC_APP_URL`
- `NEXTAUTH_URL` must match `PUBLIC_APP_URL`
- `JWT_SECRET`, `NEXTAUTH_SECRET`, `MYSQL_ROOT_PASSWORD`, `DATABASE_PASSWORD`, and `SMTP_PASS` must be strong secrets

## 2. Build and start containers

Run:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Check status:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
```

## 3. Run database setup

After the containers are up, generate Prisma client and apply the schema:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec api pnpm --filter @dobrokot/api db:generate
docker compose --env-file .env.production -f docker-compose.prod.yml exec api pnpm --filter @dobrokot/api db:push
```

If you later switch to versioned migrations, replace `db:push` with your migration command.

## 4. Put a reverse proxy in front

For real production, place Nginx or Caddy in front of:

- `web` on port `3000`
- `api` on port `4000`

Minimum requirements for the proxy:

- HTTPS enabled
- requests to the frontend domain forwarded to `http://127.0.0.1:3000`
- requests to the API domain forwarded to `http://127.0.0.1:4000`

## 5. Verify after deploy

Check these endpoints:

- `https://your-app-domain/`
- `https://your-api-domain/health`

Also verify:

- donor search works
- map opens and geocoding resolves addresses
- login works
- emails are sent if SMTP is configured

## Update flow

When releasing a new version:

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

If the Prisma schema changed:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec api pnpm --filter @dobrokot/api db:push
```

## Notes

- The browser must reach the API through a public URL. Do not use `http://api:4000/api` for `NEXT_PUBLIC_API_URL` in production.
- Current production deployment is optimized for one server with Docker Compose. If you want, this can later be split into managed services: frontend hosting, managed MySQL, and managed Redis.
