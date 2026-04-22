# DoBroKot: карта проекта и описание модулей

## Что это за проект

`DoBroKot` — монорепозиторий платформы для поиска доноров крови среди животных. В текущем состоянии проект состоит из:

- `apps/api` — backend API на `Express` + `Prisma`.
- `apps/web` — frontend на `Next.js 15`.
- `packages/shared` — общие схемы валидации и типы, которыми пользуются и backend, и frontend.

Сборка и запуск пакетов координируются через `pnpm workspace` и `Turborepo`.

## Как устроен репозиторий

### Корень монорепы

- `package.json` — общие команды монорепы: `dev`, `build`, `lint`, `db:*`, `clean`.
- `pnpm-workspace.yaml` — объявляет workspace-пакеты: `apps/*` и `packages/*`.
- `turbo.json` — описывает пайплайны `turbo`:
  - `dev` запускается без кэша и в persistent-режиме.
  - `build` сначала собирает зависимости (`^build`), затем сохраняет `.next/**` и `dist/**`.
  - `db:*` и `clean` выполняются без кэширования.
- `docker-compose.yml` — локальная инфраструктура из `mysql`, `redis`, `api`, `web`.
- `.env.example` — пример переменных окружения для всех частей проекта.
- `.gitignore` — стандартные исключения для Node.js, Turbo, Prisma, Docker и IDE.

## Технологический стек

- Монорепа: `pnpm`, `turbo`
- Frontend: `Next.js 15`, `React 19`, `next-auth`, `Tailwind CSS 4`
- Backend: `Express`, `Prisma`, `MySQL`, `Redis`, `JWT`, `Zod`
- Общий контракт: `@dobrokot/shared`
- Инфраструктура: `Docker`, `docker-compose`

## Связи между пакетами

### `packages/shared` как единый контракт

Пакет `@dobrokot/shared` — центральная точка согласования данных между клиентом и сервером:

- backend использует его схемы в middleware `validate(...)`;
- frontend может использовать те же типы и схемы при работе с формами и API;
- это уменьшает риск рассинхронизации форматов запросов.

### Общий поток данных

Типовой запрос проходит так:

1. Пользователь вызывает страницу или действие во `web`.
2. `web` отправляет запрос в `api`.
3. `api` прогоняет входные данные через `Zod`-схемы из `shared`.
4. Контроллер передаёт задачу в сервис.
5. Сервис работает с `Prisma`, `JWT`, `Redis` или другими библиотеками.
6. Ответ возвращается в формате `{ success, data | error }`.

## `packages/shared`

Пакет содержит только исходники и не имеет собственной runtime-логики. Его задача — описывать входные данные, enum-значения и shape ответов.

### `packages/shared/src/index.ts`

Реэкспортирует всё из схем и типов. Благодаря этому остальные пакеты импортируют зависимости одной строкой, например `import { registerSchema } from "@dobrokot/shared"`.

### `packages/shared/src/schemas/user.ts`

Отвечает за доменную модель пользователя и связанные формы:

- `UserRole` — роли пользователей: `OWNER`, `CLINIC`, `VOLUNTEER`, `ADMIN`.
- `registerSchema` — правила регистрации.
- `loginSchema` — правила логина.
- `updateProfileSchema` — правила обновления профиля.

Этот модуль особенно важен для `apps/api/src/routes/auth.routes.ts` и `apps/api/src/routes/users.routes.ts`.

### `packages/shared/src/schemas/animal.ts`

Описывает всё, что связано с животными:

- `AnimalType` — тип животного: `DOG` или `CAT`.
- `DogBloodType` и `CatBloodType` — допустимые группы крови.
- `createAnimalSchema` — создание карточки животного.
- `updateAnimalSchema` — редактирование карточки.
- `searchDonorsSchema` — параметры поиска доноров.

Здесь же есть важная бизнес-проверка: группа крови валидируется по типу животного.

### `packages/shared/src/schemas/donation.ts`

Содержит контракты донорских сценариев:

- `Urgency` — срочность запроса.
- `RequestStatus` — статус запроса на донорство.
- `ResponseStatus` — статус отклика на запрос.
- `createDonationRequestSchema` — создание запроса.
- `createDonationResponseSchema` — отклик донора.
- `sendMessageSchema` — отправка сообщения.

### `packages/shared/src/types/index.ts`

Набор интерфейсов для обмена данными:

- `ApiResponse<T>` — стандартный формат ответа API.
- `PaginatedResponse<T>` — формат пагинации.
- `TokenPair` — access/refresh токены.
- `UserPublic`, `AnimalPublic`, `DonationRequestPublic` — публичные проекции сущностей.

## `apps/api`

Backend организован по классической схеме:

- `routes` принимают HTTP-маршруты;
- `controllers` адаптируют Express к бизнес-логике;
- `services` содержат основную доменную логику;
- `lib` инкапсулирует внешние клиенты;
- `middleware` закрывает валидацию, авторизацию и обработку ошибок.

### Точка входа и конфиг

#### `apps/api/src/index.ts`

Главный файл сервера:

- создаёт `Express`-приложение;
- подключает `helmet`, `cors`, `morgan`, `express.json`;
- монтирует API на `/api`;
- отдаёт `/health`;
- подключает глобальный `errorHandler`;
- при старте делает `prisma.$connect()` и `redis.connect()`;
- запускает сервер на `config.port`.

Именно этот файл связывает воедино все backend-модули.

#### `apps/api/src/config/index.ts`

Собирает переменные окружения через `dotenv` и экспортирует единый объект `config`:

- `port`, `nodeEnv`, `corsOrigin`;
- настройки JWT;
- адрес Redis;
- SMTP-настройки.

Это центральная точка конфигурации backend.

### Библиотеки доступа к инфраструктуре

#### `apps/api/src/lib/prisma.ts`

Создаёт singleton `PrismaClient`. В development-режиме клиент кэшируется на `globalThis`, чтобы не плодить соединения при hot reload.

#### `apps/api/src/lib/redis.ts`

Создаёт Redis-клиент на `ioredis` с `lazyConnect: true` и обработчиком ошибок. Сейчас Redis подключается на старте приложения, но в текущем коде почти не участвует в бизнес-логике.

#### `apps/api/src/lib/jwt.ts`

Оборачивает работу с `jsonwebtoken`:

- `signAccessToken(...)`
- `signRefreshToken(...)`
- `verifyToken(...)`

Этот модуль используется и в auth-сервисе, и в middleware авторизации.

### Middleware

#### `apps/api/src/middleware/auth.ts`

Отвечает за безопасность маршрутов:

- `authenticate` читает `Authorization: Bearer ...`, проверяет JWT и записывает `req.userId`/`req.userRole`;
- `authorize(...roles)` ограничивает доступ по ролям.

Важно: `authorize(...)` реализован, но в текущих роутингах почти не используется.

#### `apps/api/src/middleware/validate.ts`

Универсальная валидация через `Zod`:

- принимает схему и источник данных (`body`, `query`, `params`);
- парсит входные данные;
- при успехе подменяет `req[source]` на уже провалидированный объект;
- при ошибке возвращает `400` с деталями полей.

Это главный мост между `@dobrokot/shared` и Express-роутами.

#### `apps/api/src/middleware/errorHandler.ts`

Глобальная обработка ошибок:

- `AppError` позволяет сервисам бросать контролируемые ошибки с HTTP-статусом;
- `errorHandler` превращает их в JSON-ответ;
- неожиданные ошибки логируются и возвращают `500`.

### Роутинг

#### `apps/api/src/routes/index.ts`

Собирает общий роутер:

- `/auth`
- `/users`
- `/animals`
- `/donations`

#### `apps/api/src/routes/auth.routes.ts`

Маршруты аутентификации:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

Для регистрации и логина используется валидация схемами из `shared`.

#### `apps/api/src/routes/users.routes.ts`

Маршруты пользователей:

- `GET /users/me` — получить свой профиль;
- `PATCH /users/me` — обновить свой профиль;
- `GET /users/:id` — получить публичный профиль пользователя.

#### `apps/api/src/routes/animals.routes.ts`

Маршруты животных:

- `GET /animals/donors` — поиск доноров;
- `GET /animals/mine` — список животных текущего пользователя;
- `GET /animals/:id` — карточка животного;
- `POST /animals` — создать животное;
- `PATCH /animals/:id` — обновить животное;
- `DELETE /animals/:id` — удалить животное.

#### `apps/api/src/routes/donations.routes.ts`

Маршруты для донорских сценариев:

- запросы на донорство;
- отклики на запросы;
- личные сообщения между участниками.

### Контроллеры

Контроллеры в проекте сделаны намеренно "тонкими": они почти не содержат бизнес-логики, а лишь вызывают сервисы и приводят результат к HTTP-ответу.

#### `apps/api/src/controllers/auth.controller.ts`

Связывает HTTP-запросы с `auth.service`:

- `register`
- `login`
- `refresh`
- `logout`

#### `apps/api/src/controllers/users.controller.ts`

Работает с `user.service`:

- `getMe`
- `updateMe`
- `getUser`

#### `apps/api/src/controllers/animals.controller.ts`

Работает с `animal.service`:

- создание, чтение, обновление, удаление животного;
- поиск доноров;
- получение животных текущего владельца.

#### `apps/api/src/controllers/donations.controller.ts`

Работает с `donation.service`:

- создание и отмена запросов;
- создание откликов и смена их статуса;
- отправка сообщений;
- получение списка диалогов и истории конкретного диалога.

### Сервисы

Сервисы — это основной слой бизнес-логики backend.

#### `apps/api/src/services/auth.service.ts`

Отвечает за аутентификацию:

- регистрирует пользователя;
- хэширует пароль через `bcrypt`;
- проверяет логин/пароль;
- создаёт access и refresh токены;
- хранит refresh токены в таблице `RefreshToken`;
- делает ротацию refresh токена при `refresh`;
- удаляет токены при `logout`.

Особенность: срок жизни записи refresh токена сейчас жёстко выставляется на 7 дней через `Date#setDate(...)`, даже если в env задано другое значение `JWT_REFRESH_EXPIRES_IN`.

#### `apps/api/src/services/user.service.ts`

Работает с профилем пользователя:

- `getProfile` — приватный профиль текущего пользователя;
- `updateProfile` — обновление полей профиля;
- `getPublicProfile` — публичная карточка пользователя и его донорских животных.

#### `apps/api/src/services/animal.service.ts`

Логика животных:

- создание записи животного;
- получение карточки;
- список животных владельца;
- проверка права владения при редактировании и удалении;
- поиск доноров с пагинацией.

Ключевая особенность — поиск по координатам:

- сперва выбираются кандидаты из базы;
- затем для каждого считается расстояние по формуле haversine;
- при наличии координат результаты фильтруются по `radiusKm` и сортируются по расстоянию.

#### `apps/api/src/services/donation.service.ts`

Логика донорских заявок и переписки:

- `createRequest` — создаёт запрос на донорство;
- `getRequests` — выдаёт список с фильтрами и пагинацией;
- `getRequest` — полная карточка запроса с откликами;
- `cancelRequest` — отменяет запрос владельцем;
- `createResponse` — создаёт отклик донора;
- `updateResponseStatus` — владелец запроса принимает или отклоняет отклик;
- `sendMessage` — отправляет сообщение;
- `getConversation` — загружает историю и помечает входящие как прочитанные;
- `getConversations` — строит список диалогов по последнему сообщению.

Здесь заложен основной бизнес-процесс платформы.

#### `apps/api/src/services/email.service.ts`

Сервис отправки email через `nodemailer`.

Сейчас он умеет:

- отправлять произвольные HTML-письма;
- отправлять письмо-уведомление о донорском запросе;
- работать в stub-режиме, если SMTP не настроен.

Важно: в текущем коде сервис подготовлен, но не подключён к сценариям `donation.service`.

### Схема базы данных

#### `apps/api/prisma/schema.prisma`

Главная доменная модель backend:

- `User` — пользователь платформы;
- `RefreshToken` — сохранённые refresh-токены;
- `Animal` — животное пользователя;
- `DonationRequest` — запрос на донорство;
- `DonationResponse` — отклик на запрос;
- `Message` — сообщения между пользователями.

Схема уже отражает базовые сценарии продукта:

- владелец может завести животных;
- животное может быть донором;
- можно публиковать запросы на кровь;
- доноры могут откликаться;
- стороны могут переписываться напрямую.

## `apps/web`

Frontend пока гораздо компактнее backend. Сейчас это скорее каркас приложения с базовой авторизацией и стартовой страницей.

### Конфигурация

#### `apps/web/next.config.ts`

Включает:

- `transpilePackages: ["@dobrokot/shared"]` — чтобы Next мог использовать код из workspace-пакета;
- `output: "standalone"` — для Docker-сборки и автономного запуска.

#### `apps/web/tsconfig.json`

Задаёт alias `@/* -> ./src/*`, поэтому импорт `@/lib/auth` ссылается на `apps/web/src/lib/auth.ts`.

### App Router

#### `apps/web/src/app/layout.tsx`

Корневой layout:

- задаёт `metadata`;
- подключает глобальные стили;
- оборачивает всё в базовый HTML-каркас.

#### `apps/web/src/app/page.tsx`

Текущая главная страница. Сейчас это простая статическая landing-page заглушка без данных и без сложного UI.

#### `apps/web/src/app/api/auth/[...nextauth]/route.ts`

Маршрут `NextAuth`, который просто экспортирует `GET` и `POST` handlers из `@/lib/auth`.

### Клиентская инфраструктура

#### `apps/web/src/lib/auth.ts`

Главный модуль аутентификации во frontend:

- поднимает `NextAuth`;
- использует `Credentials` provider;
- отправляет логин в backend `POST /auth/login`;
- сохраняет `id`, `role`, `accessToken`, `refreshToken` в JWT-сессии;
- прокидывает `accessToken` и `role` в `session`.

По сути, это мост между frontend-сессией и backend-аутентификацией.

#### `apps/web/src/lib/api.ts`

Минимальный обёрточный клиент над `fetch`:

- добавляет `Content-Type: application/json`;
- при наличии токена ставит `Authorization: Bearer ...`;
- вызывает backend по `NEXT_PUBLIC_API_URL`;
- распаковывает ответ и выбрасывает ошибку, если `res.ok === false`.

Это главный модуль для будущих запросов из страниц и серверных actions.

#### `apps/web/src/lib/utils.ts`

Вспомогательная функция `cn(...)` для объединения CSS-классов через `clsx` и `tailwind-merge`. Нужна для компонентного UI.

### Стили

#### `apps/web/src/app/globals.css`

Глобальная тема на Tailwind v4:

- объявляет дизайн-токены через CSS custom properties;
- поддерживает светлую и тёмную тему;
- задаёт базовые цвета и radius;
- подключает typography plugin.

Сейчас дизайн-система ещё минимальная, но техническая база уже заложена.

## Docker и запуск

### `docker-compose.yml`

Файл поднимает 4 сервиса:

- `mysql` — основная база данных;
- `redis` — key-value storage;
- `api` — backend на `4000`;
- `web` — frontend на `3000`.

Порядок связей такой:

- `api` ждёт готовности `mysql` и `redis`;
- `web` зависит от `api`.

### `apps/api/Dockerfile`

Многостадийная сборка backend:

- ставит зависимости;
- генерирует Prisma client;
- собирает TypeScript в `dist`;
- копирует runtime-артефакты в финальный image.

### `apps/web/Dockerfile`

Многостадийная сборка frontend:

- ставит зависимости;
- билдит `Next.js`;
- копирует standalone-сборку в финальный контейнер;
- запускает `node apps/web/server.js`.

## Сквозные сценарии работы

### 1. Регистрация и логин

1. Frontend или клиент вызывает `POST /api/auth/register` или `POST /api/auth/login`.
2. Входные данные валидируются схемами из `@dobrokot/shared`.
3. `auth.service` создаёт или находит пользователя.
4. Пароль проверяется через `bcrypt`.
5. Генерируются JWT access/refresh токены.
6. Refresh токен сохраняется в базе.

### 2. Поиск донора

1. Клиент вызывает `GET /api/animals/donors`.
2. Параметры поиска валидируются схемой `searchDonorsSchema`.
3. `animal.service.searchDonors(...)` фильтрует животных-доноров.
4. Если переданы координаты, сервис считает расстояние и сортирует выдачу.
5. Клиент получает пагинированный список.

### 3. Работа с заявками на кровь

1. Авторизованный пользователь создаёт `DonationRequest`.
2. Другой пользователь откликается через `DonationResponse`.
3. Если запрос был `OPEN`, он переводится в `IN_PROGRESS`.
4. Владелец запроса может принять отклик.
5. При принятии запрос переводится в `FULFILLED`.

### 4. Сообщения между участниками

1. Пользователь отправляет сообщение через `POST /api/donations/messages`.
2. `donation.service.sendMessage(...)` сохраняет его в таблице `Message`.
3. История диалога загружается через `getConversation(...)`.
4. Непрочитанные входящие автоматически помечаются как `isRead = true`.

## Что уже хорошо отделено

- Контракты запросов вынесены в `shared`.
- Контроллеры не перегружены логикой.
- Prisma спрятан в сервисный слой.
- Подготовлены Docker-сборки для обеих частей системы.
- Есть база для аутентификации, поиска доноров, заявок и переписки.

## Что пока выглядит как заготовка или точка роста

- `apps/web` пока содержит только базовый каркас и одну стартовую страницу.
- Redis подключается, но не используется как кэш, очередь или session-store.
- `email.service` не встроен в бизнес-процессы.
- Ролевое ограничение `authorize(...)` есть, но почти не применяется в маршрутах.
- Нет тестов и отдельного слоя DTO/mapper-объектов.
- В `auth.service` срок хранения refresh токена в базе сейчас жёстко равен 7 дням.

## Короткий вывод

Проект уже имеет хорошую основу для MVP:

- backend покрывает ключевую доменную логику;
- shared-пакет задаёт единый контракт данных;
- frontend умеет авторизовываться и готов к наращиванию экранов;
- инфраструктура рассчитана и на локальную разработку, и на контейнерный запуск.

Если смотреть на репозиторий как на систему, то `apps/api` сейчас является ядром продукта, `packages/shared` — его контрактом, а `apps/web` — лёгкой клиентской оболочкой, которую дальше можно быстро наращивать поверх уже готового API.
