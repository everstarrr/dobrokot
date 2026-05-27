# Деплой dobrokot в прод (с сохранением данных)

Алгоритм рассчитан на один Linux-сервер с Docker Engine + Docker Compose v2.
Стек: MySQL 8 (named volume), Express + Prisma API, Next.js web — всё через
`docker-compose.prod.yml`. Данные БД сохраняются между релизами за счёт
**именованного тома `mysql_data`** + **версионных миграций Prisma**
(`prisma migrate deploy`), а не `db:push`.

> ⚠️ В корне репо есть `DEPLOY.md` / `DOCKER.md`, где для обновления схемы
> упоминается `db:push`. На проде так **не делать** — `db:push` при расхождении
> может пересоздать таблицы. Использовать только `db:deploy`
> (`prisma migrate deploy`) — см. шаг 5.

---

## 0. Требования к серверу

- Ubuntu 22.04+ / Debian 12+
- 2 vCPU / 4 GB RAM / 30 GB SSD (минимум)
- Docker Engine 24+ и плагин `docker compose`
- Открытые порты 80/443 наружу (фронт + API проксируем через Nginx/Caddy);
  3306/4000/3000 контейнеров наружу выставлять не нужно
- Доменные имена с DNS на сервер: `dobrokot.ru` (фронт) и `api.dobrokot.ru` (API)

Проверить, что Docker работает:

```bash
docker --version && docker compose version
```

---

## 1. Подготовка кода и секретов

```bash
sudo mkdir -p /srv/dobrokot && sudo chown $USER /srv/dobrokot
cd /srv/dobrokot
git clone <repo-url> .
git checkout master                 # или нужный релизный тег
cp .env.example .env.production
```

Отредактировать `.env.production`. Обязательные значения:

| Переменная | Что положить |
|---|---|
| `MYSQL_ROOT_PASSWORD` | сильный пароль (24+ символа) |
| `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` | прод-учётка БД |
| `DATABASE_HOST` | `mysql` (имя сервиса в compose) |
| `DATABASE_PORT` | `3306` |
| `DATABASE_URL` | `mysql://<USER>:<PASS>@mysql:3306/<DB>` (URL-encode пароля!) |
| `DATABASE_CONNECTION_LIMIT` | `10` (или больше под нагрузку) |
| `JWT_SECRET` | 32+ случайных байта (`openssl rand -hex 32`) |
| `NEXTAUTH_SECRET` | то же, отдельный |
| `CORS_ORIGIN` | `https://dobrokot.ru` |
| `NEXTAUTH_URL` | `https://dobrokot.ru` |
| `NEXT_PUBLIC_API_URL` | `https://api.dobrokot.ru/api` |
| `SMTP_*` | реальные SMTP-доступы (или удалить блок, если письма не нужны) |

Закрыть файл от чужих глаз:

```bash
chmod 600 .env.production
```

---

## 2. Первый запуск (cold start)

Сборка образов и поднятие стека:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Что произойдёт автоматически:

1. Поднимется `mysql` с томом `mysql_data` (данные лежат вне контейнера —
   пересборка/перезапуск контейнера данные **не удаляет**).
2. Стартует одноразовый сервис `api-init` → `pnpm --filter @dobrokot/api db:deploy`
   → накатывает все версионные миграции (`apps/api/prisma/migrations/*`),
   включая последнюю `20260527140000_add_rank_to_donor`.
3. После успешного завершения `api-init` стартуют `api` и `web`.

Проверка:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs api-init
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
curl http://127.0.0.1:4000/health
```

Должно вернуться `{"status":"ok",...}`.

---

## 3. Reverse proxy (Nginx)

Поставить Nginx + certbot на хост, добавить два vhost-а:

```nginx
# /etc/nginx/sites-available/dobrokot
server {
    listen 443 ssl http2;
    server_name dobrokot.ru;
    # ... ssl_certificate / ssl_certificate_key (certbot) ...

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.dobrokot.ru;
    # ... ssl_certificate / ssl_certificate_key ...

    client_max_body_size 2m;          # под лимит express.json
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/dobrokot /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d dobrokot.ru -d api.dobrokot.ru
```

---

## 4. Бэкап БД (выполнять перед каждым деплоем)

Данные живут в томе `mysql_data`. Сами они переживут любой
`docker compose up/down/restart`, но **не переживут** `docker compose down -v`
или ручной `docker volume rm`. Поэтому перед каждым релизом — дамп.

```bash
mkdir -p /srv/dobrokot/backups
TS=$(date +%F_%H%M%S)
docker compose --env-file .env.production -f docker-compose.prod.yml \
  exec -T mysql sh -c \
  'exec mysqldump --single-transaction --routines --triggers --default-character-set=utf8mb4 \
    -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  | gzip > "/srv/dobrokot/backups/dobrokot_${TS}.sql.gz"
```

Проверить, что дамп не пустой и UTF-8:

```bash
gunzip -c /srv/dobrokot/backups/dobrokot_${TS}.sql.gz | head -50
ls -lh /srv/dobrokot/backups/ | tail -5
```

Хранить минимум последние 7 ежедневных дампов. Под крон:

```cron
# /etc/cron.d/dobrokot-backup  (минута час день месяц день_недели)
0 3 * * * root /srv/dobrokot/scripts/backup.sh >> /var/log/dobrokot-backup.log 2>&1
```

Дополнительно — копировать дампы за пределы сервера (rsync/S3/Yandex Object
Storage) хотя бы раз в сутки.

---

## 5. Релиз новой версии (с сохранением данных)

```bash
cd /srv/dobrokot

# 5.1 — сделать бэкап (см. шаг 4)
./scripts/backup.sh                  # или скопировать вручную из шага 4

# 5.2 — забрать новый код
git fetch --all
git checkout <release-tag-or-master>
git pull --ff-only

# 5.3 — пересобрать образы и поднять, миграции накатятся в api-init
docker compose --env-file .env.production -f docker-compose.prod.yml \
  up -d --build --remove-orphans

# 5.4 — убедиться, что миграции прошли
docker compose --env-file .env.production -f docker-compose.prod.yml logs api-init | tail -50
docker compose --env-file .env.production -f docker-compose.prod.yml exec api \
  pnpm --filter @dobrokot/api exec prisma migrate status

# 5.5 — smoke-проверка
curl -sf https://api.dobrokot.ru/health
curl -sfX POST https://api.dobrokot.ru/api/blood/check \
  -H 'Content-Type: application/json' \
  -d '{"animalType":"CAT","bloodType":"A"}'
```

### Чего НЕ делать

- ❌ `db:push` на проде — игнорирует миграции и может пересоздать таблицы.
- ❌ `prisma migrate reset` — стирает все данные.
- ❌ `docker compose down -v` / `docker volume rm dobrokot_mysql_data` — то же.
- ❌ Удалять файлы из `apps/api/prisma/migrations/*` — Prisma считает удалённую
  миграцию рассинхроном и заблокирует деплой.
- ❌ Менять `DATABASE_NAME` / `DATABASE_USER` после первого запуска без миграции
  данных вручную.

### Если миграция новая и затрагивает данные

1. Сначала на staging-сервере с копией прод-дампа прогнать `migrate deploy`,
   убедиться, что данные не теряются.
2. Если миграция требует ручной заливки данных (UPDATE/INSERT), оформить её
   как обычную SQL-миграцию в `apps/api/prisma/migrations/<ts>_<name>/migration.sql`
   — `migrate deploy` накатит её в той же транзакции, что и схему.
3. Если миграция несовместима с running-API (например, дропает колонку, которой
   ещё пользуется старый код), деплоить **в два шага**:
   1) выкатить релиз, который умеет работать и со старой, и с новой колонкой;
   2) после стабилизации выкатить релиз с миграцией, который убирает старую.

---

## 6. Откат при провале релиза

### Вариант А — есть теги в git

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
git checkout <previous-tag>
docker compose --env-file .env.production -f docker-compose.prod.yml \
  up -d --build --remove-orphans
```

Откат кода **не откатывает** миграции автоматически. Если новая миграция
поломала данные, нужно восстановить дамп (вариант Б).

### Вариант Б — восстановление БД из дампа

```bash
# Остановить только api/web, mysql оставить
docker compose --env-file .env.production -f docker-compose.prod.yml \
  stop api web

# Восстановить дамп
gunzip -c /srv/dobrokot/backups/dobrokot_<TS>.sql.gz | \
  docker compose --env-file .env.production -f docker-compose.prod.yml \
    exec -T mysql sh -c \
    'exec mysql --default-character-set=utf8mb4 -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'

# Поднять обратно
docker compose --env-file .env.production -f docker-compose.prod.yml \
  up -d
```

> Если дамп старее последней применённой миграции — после восстановления
> прогнать `migrate deploy` ещё раз: он добьёт недостающие миграции на
> восстановленных данных.

---

## 7. Проверки после деплоя

- `https://dobrokot.ru/` — главная грузится.
- `https://api.dobrokot.ru/health` → `{"status":"ok"}`.
- Регистрация (`POST /api/auth/register`) с кириллическим именем не превращает
  его в `�` (на проде должен работать `utf8mb4` charset из `apps/api/src/lib/prisma.ts`).
- Логин → cookie/token → `GET /api/users/me` отдаёт текущего юзера.
- Без подписки `POST /api/blood/search` отдаёт 402; после
  `POST /api/subscription/activate` — 200.
- `https://api.dobrokot.ru/api/donors` отдаёт реальные данные с
  `rank: "LEGENDARY_DONOR" / "RELIABLE_ASSISTANT"`.

---

## 8. Раз в месяц / ритуалы эксплуатации

- Проверить, что cron-бэкапы выполняются и копируются вовне.
- `docker system prune -af --filter "until=168h"` — почистить старые образы.
- Обновить базовые образы: `docker compose -f docker-compose.prod.yml pull`,
  затем релиз по шагу 5.
- Сверить `prisma migrate status` — не должно быть pending/failed миграций.
- Просмотреть `docker compose logs --since 24h api | grep -Ei 'error|prisma:'`.

---

## Короткая шпаргалка

```bash
# Бэкап
./scripts/backup.sh

# Деплой
git pull && docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

# Логи
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api

# Статус миграций
docker compose --env-file .env.production -f docker-compose.prod.yml \
  exec api pnpm --filter @dobrokot/api exec prisma migrate status

# Восстановление БД
gunzip -c backups/<dump>.sql.gz | docker compose ... exec -T mysql \
  sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
```
