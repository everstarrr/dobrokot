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

- Ubuntu 22.04+ / Debian 12+ (далее команды для Ubuntu; на Debian идентично)
- 2 vCPU / 4 GB RAM / 30 GB SSD (минимум)
- DNS у двух доменов проброшен на сервер: `dobrokot.ru` (фронт),
  `api.dobrokot.ru` (API)
- Доступ по SSH под `root` (если будете деплоить под другим пользователем —
  выполняйте все команды ниже через `sudo`)

> Деплой под root — компромисс для одного небольшого сервера: меньше шагов,
> не нужно возиться с группами `docker`/`sudo`. На больших инсталляциях лучше
> завести отдельного пользователя без shell-доступа и ограничить root по SSH.

Что будем ставить на хост:

| Служба | Зачем |
|---|---|
| Docker Engine 24+ | контейнеры всего стека (MySQL/API/Web через `docker compose`) |
| Docker Compose plugin | оркестрация `docker-compose.prod.yml` (идёт вместе с Docker CE) |
| Nginx | HTTPS-прокси перед контейнерами `web`/`api` |
| Certbot | бесплатные TLS-сертификаты Let's Encrypt |
| UFW | системный firewall, режем всё кроме 22/80/443 |
| Fail2ban | защита SSH от перебора |
| Git, curl, gnupg, jq, unzip | базовый CLI-инструментарий и `apt`-source для Docker |

> Сами MySQL/Node не ставятся на хост — они живут в контейнерах. На хосте
> только то, что обслуживает контейнеры снаружи (прокси, firewall, бэкапы).

---

## 0.1. Базовая настройка хоста

Все команды ниже — из-под `root` (если зашли иначе, перейдите через `sudo -i`).

```bash
apt update && apt upgrade -y
timedatectl set-timezone Europe/Moscow      # или нужный TZ
apt install -y locales
locale-gen ru_RU.UTF-8 en_US.UTF-8
update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
```

Жёстко рекомендуется: при входе под root оставить **только** аутентификацию
по ssh-ключу, отключить парольный вход:

```bash
sed -i \
  -e 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' \
  -e 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' \
  /etc/ssh/sshd_config
systemctl restart ssh
```

Включить swap (если на VPS меньше 8 GB RAM):

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 0.2. Базовые пакеты, firewall и Fail2ban

```bash
apt install -y ca-certificates curl gnupg lsb-release git ufw fail2ban jq unzip
```

UFW:

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose
```

Fail2ban оставляем с дефолтным `sshd`-jail-ом:

```bash
systemctl enable --now fail2ban
fail2ban-client status
```

---

## 0.3. Docker Engine + Docker Compose

Ставим официальный репозиторий Docker (а не `docker.io` из ubuntu-репо —
он отстаёт по версиям и не включает плагин `compose`):

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
   https://download.docker.com/linux/ubuntu \
   $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

apt update
apt install -y docker-ce docker-ce-cli containerd.io \
                docker-buildx-plugin docker-compose-plugin
```

> Для Debian 12 заменить `ubuntu` на `debian` в обоих URL и в репозитории.

Проверка:

```bash
docker run --rm hello-world
docker compose version
```

(под root в группу `docker` добавлять никого не надо — root уже имеет полный
доступ к сокету `/var/run/docker.sock`).

Включить лимит логов (иначе `json-file` забьёт диск), создать
`/etc/docker/daemon.json`:

```bash
cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "5" },
  "live-restore": true
}
JSON
systemctl restart docker
```

---

## 0.4. Nginx + Certbot

```bash
apt install -y nginx
systemctl enable --now nginx
# certbot из snap'а (актуальная версия с плагином для nginx):
apt install -y snapd
snap install core && snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot
```

Проверить, что Nginx отвечает:

```bash
curl -I http://localhost/
```

Конфиг vhost-ов и выпуск сертификатов идёт ниже, в **шаге 3**, после того
как контейнеры подняты.

---

## 0.5. Проверка готовности окружения

```bash
docker --version && docker compose version
nginx -v
certbot --version
ufw status
fail2ban-client status sshd
free -h && df -h /
```

Всё должно отвечать без ошибок и UFW — `Status: active` с открытыми `22/tcp`,
`80/tcp`, `443/tcp`.

---

## 1. Подготовка кода и секретов

```bash
mkdir -p /root/dobrokot
cd /root/dobrokot
git clone <repo-url> .
git checkout master                 # или нужный релизный тег
cp .env.example .env.production
```

> Если хочется хранить вне `/root` — `mkdir -p /srv/dobrokot && cd /srv/dobrokot`
> работает так же. В шагах ниже путь не зашит, важно только остаться в этой
> директории.

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

**Важно**: пишем конфиг сначала **только на 80 порту** (HTTPS блоки добавит
certbot после выпуска сертификата). Если сразу указать `listen 443 ssl` без
`ssl_certificate`, nginx упадёт с `no "ssl_certificate" is defined`.

```nginx
# /etc/nginx/sites-available/dobrokot
server {
    listen 80;
    server_name dobrokot.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.dobrokot.ru;

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
ln -s /etc/nginx/sites-available/dobrokot /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# DNS обоих доменов должен уже указывать на этот сервер — проверь:
curl -I http://dobrokot.ru
curl -I http://api.dobrokot.ru

# Выпуск SSL: certbot сам допишет `listen 443 ssl` блоки и редирект 80 → 443
certbot --nginx -d dobrokot.ru -d api.dobrokot.ru \
        --redirect --agree-tos -m admin@dobrokot.ru --no-eff-email
```

---

## 4. Бэкап БД (выполнять перед каждым деплоем)

Данные живут в томе `mysql_data`. Сами они переживут любой
`docker compose up/down/restart`, но **не переживут** `docker compose down -v`
или ручной `docker volume rm`. Поэтому перед каждым релизом — дамп.

```bash
mkdir -p /root/dobrokot/backups
TS=$(date +%F_%H%M%S)
cd /root/dobrokot
docker compose --env-file .env.production -f docker-compose.prod.yml \
  exec -T mysql sh -c \
  'exec mysqldump --single-transaction --routines --triggers --default-character-set=utf8mb4 \
    -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  | gzip > "/root/dobrokot/backups/dobrokot_${TS}.sql.gz"
```

Проверить, что дамп не пустой и UTF-8:

```bash
gunzip -c /root/dobrokot/backups/dobrokot_${TS}.sql.gz | head -50
ls -lh /root/dobrokot/backups/ | tail -5
```

Хранить минимум последние 7 ежедневных дампов. Под крон:

```cron
# /etc/cron.d/dobrokot-backup  (минута час день месяц день_недели)
0 3 * * * root /root/dobrokot/scripts/backup.sh >> /var/log/dobrokot-backup.log 2>&1
```

Дополнительно — копировать дампы за пределы сервера (rsync/S3/Yandex Object
Storage) хотя бы раз в сутки.

---

## 5. Релиз новой версии (с сохранением данных)

```bash
cd /root/dobrokot

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
gunzip -c /root/dobrokot/backups/dobrokot_<TS>.sql.gz | \
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
