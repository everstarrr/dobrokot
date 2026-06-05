# Таблицы моделей БД

Формат — строки с разделителем `|`. Чтобы вставить в Word: выделить нужный
блок (строки от заголовочной `| Поле | ... |` до последней строки таблицы),
скопировать → в Word: **Вставка → Таблица → Преобразовать в таблицу** →
разделитель **«|»**. После вставки удалить первый и последний (пустые)
столбцы — они появляются из-за лидирующих/замыкающих `|`.


## User

Таблица: `User`. Учётная запись участника платформы (владелец животного,
представитель клиники, администратор).

| Поле | Тип SQL | NULL | По умолчанию | Описание |
| id | VARCHAR(191) PK | нет | uuid() | Идентификатор |
| email | VARCHAR(191) UNIQUE | нет | — | Email, используется для входа |
| passwordHash | VARCHAR(191) | нет | — | bcrypt-хеш пароля (rounds = 12) |
| name | VARCHAR(191) | нет | — | Имя пользователя |
| phone | VARCHAR(191) | да | NULL | Телефон |
| role | ENUM(UserRole) | нет | OWNER | Роль (OWNER/CLINIC/ADMIN) |
| city | VARCHAR(191) | да | NULL | Город |
| latitude | DOUBLE | да | NULL | Широта пользователя |
| longitude | DOUBLE | да | NULL | Долгота пользователя |
| avatarUrl | VARCHAR(191) | да | NULL | URL аватара |
| isVerified | BOOLEAN | нет | false | Прошёл ли верификацию |
| subscriptionPlan | ENUM(SubscriptionPlan) | да | NULL | Текущий тариф подписки (WEEK/MONTH) |
| subscriptionExpiresAt | DATETIME(3) | да | NULL | Дата истечения подписки |
| createdAt | DATETIME(3) | нет | CURRENT_TIMESTAMP(3) | Дата создания |
| updatedAt | DATETIME(3) | нет | — | Дата обновления |

Индексы: `User_email_key` (UNIQUE по email), `User_city_idx`,
`User_role_idx`, `User_subscriptionExpiresAt_idx`.
Связи: 1-N с `RefreshToken`, 1-1 с `Clinic` (через уникальный `Clinic.userId`).


## RefreshToken

Таблица: `RefreshToken`. Хранит выпущенные refresh-токены для отзыва сессий.

| Поле | Тип SQL | NULL | По умолчанию | Описание |
| id | VARCHAR(191) PK | нет | uuid() | Идентификатор |
| token | VARCHAR(500) UNIQUE | нет | — | Сама строка JWT refresh-токена |
| userId | VARCHAR(191) FK | нет | — | Ссылка на User.id, ON DELETE CASCADE |
| expiresAt | DATETIME(3) | нет | — | Срок истечения токена |
| createdAt | DATETIME(3) | нет | CURRENT_TIMESTAMP(3) | Дата выпуска |

Индексы: `RefreshToken_token_key` (UNIQUE), `RefreshToken_userId_idx`,
`RefreshToken_expiresAt_idx`.


## Clinic

Таблица: `Clinic`. Ветеринарная клиника, зарегистрированная на платформе.

| Поле | Тип SQL | NULL | По умолчанию | Описание |
| id | VARCHAR(191) PK | нет | uuid() | Идентификатор |
| userId | VARCHAR(191) FK UNIQUE | нет | — | Ссылка на User.id (роль CLINIC), ON DELETE CASCADE |
| title | VARCHAR(191) | нет | — | Название клиники |
| description | TEXT | да | NULL | Описание клиники |
| phone | VARCHAR(32) | да | NULL | Контактный телефон |
| contactEmail | VARCHAR(191) | да | NULL | Контактный email |
| websiteUrl | VARCHAR(2048) | да | NULL | Сайт |
| address | VARCHAR(255) | да | NULL | Адрес |
| city | VARCHAR(100) | да | NULL | Город |
| latitude | DOUBLE | да | NULL | Широта |
| longitude | DOUBLE | да | NULL | Долгота |
| workingHours | VARCHAR(255) | да | NULL | Часы работы (строка) |
| licenseNo | VARCHAR(100) | да | NULL | Номер лицензии (виден только подписчикам) |
| verificationStatus | ENUM(ClinicVerificationStatus) | нет | PENDING | Статус верификации |
| createdAt | DATETIME(3) | нет | CURRENT_TIMESTAMP(3) | Дата создания |
| updatedAt | DATETIME(3) | нет | — | Дата обновления |

Индексы: `Clinic_userId_key` (UNIQUE), `Clinic_city_idx`, `Clinic_title_idx`,
`Clinic_verificationStatus_idx`.
Связи: 1-1 с `User`, 1-N с `BloodInventory`.


## BloodInventory

Таблица: `BloodInventory`. Позиция запаса крови, принадлежащая клинике.

| Поле | Тип SQL | NULL | По умолчанию | Описание |
| id | VARCHAR(191) PK | нет | uuid() | Идентификатор |
| clinicId | VARCHAR(191) FK | нет | — | Ссылка на Clinic.id, ON DELETE CASCADE |
| animalType | ENUM(AnimalType) | нет | — | Вид животного (DOG/CAT) |
| bloodType | VARCHAR(20) | нет | — | Группа крови (значение зависит от animalType) |
| volumeMl | DOUBLE | да | NULL | Объём в миллилитрах |
| unitsCount | INT | нет | 1 | Количество единиц запаса |
| donationDate | DATETIME(3) | да | NULL | Дата заготовки |
| expiresAt | DATETIME(3) | да | NULL | Срок годности |
| status | ENUM(BloodInventoryStatus) | нет | AVAILABLE | Статус позиции |
| notes | TEXT | да | NULL | Внутренние заметки клиники |
| donorRef | VARCHAR(191) | да | NULL | Идентификатор донора во внутреннем учёте клиники |
| createdAt | DATETIME(3) | нет | CURRENT_TIMESTAMP(3) | Дата создания |
| updatedAt | DATETIME(3) | нет | — | Дата обновления |

Индексы: `BloodInventory_clinicId_idx`,
`BloodInventory_animalType_bloodType_status_idx` (составной — основной запрос
«найти все AVAILABLE-позиции крови по виду и группе»),
`BloodInventory_expiresAt_idx`.


## PartnershipRequest

Таблица: `PartnershipRequest`. Публичная заявка клиники на подключение к платформе.

| Поле | Тип SQL | NULL | По умолчанию | Описание |
| id | VARCHAR(191) PK | нет | uuid() | Идентификатор |
| contactName | VARCHAR(191) | нет | — | Имя контактного лица |
| contactEmail | VARCHAR(191) | нет | — | Email заявителя |
| contactPhone | VARCHAR(32) | да | NULL | Телефон заявителя |
| clinicTitle | VARCHAR(191) | нет | — | Название клиники |
| city | VARCHAR(100) | да | NULL | Город клиники |
| message | TEXT | да | NULL | Сообщение от заявителя |
| status | ENUM(PartnershipRequestStatus) | нет | NEW | Статус обработки заявки |
| processedAt | DATETIME(3) | да | NULL | Дата обработки |
| processedBy | VARCHAR(191) | да | NULL | Идентификатор администратора, обработавшего заявку |
| provisionedUserId | VARCHAR(191) | да | NULL | Идентификатор созданного по заявке пользователя |
| createdAt | DATETIME(3) | нет | CURRENT_TIMESTAMP(3) | Дата создания |
| updatedAt | DATETIME(3) | нет | — | Дата обновления |

Индексы: `PartnershipRequest_status_idx`, `PartnershipRequest_contactEmail_idx`.


## Partner

Таблица: `partners` (Prisma-модель `Partner`). Справочник партнёров платформы
для витрины проекта.

| Поле | Тип SQL | NULL | По умолчанию | Описание |
| id | INT PK AUTO_INCREMENT | нет | — | Идентификатор |
| rank | ENUM(PartnerRank) | нет | — | Ранг (LEGENDARY_DONOR/RELIABLE_ASSISTANT) |
| title | VARCHAR(191) | нет | — | Отображаемое название |
| image_url | VARCHAR(2048) | нет | — | URL логотипа |
| type | ENUM(PartnerType) | нет | — | Тип организации (VETERINARY_CLINIC/SHELTER) |
| blood_donations | INT | нет | — | Счётчик донаций крови |
| plasma_donations | INT | нет | — | Счётчик донаций плазмы |

Индексы: `partners_rank_idx`, `partners_type_idx`, `partners_title_idx`.


## Donor

Таблица: `donors` (Prisma-модель `Donor`). Публично отображаемый донор для
страницы «Наши результаты».

| Поле | Тип SQL | NULL | По умолчанию | Описание |
| id | VARCHAR(191) PK | нет | uuid() | Идентификатор |
| image_url | VARCHAR(2048) | нет | — | URL изображения |
| title | VARCHAR(191) | нет | — | Отображаемое имя |
| address | VARCHAR(191) | нет | — | Адрес |
| rank | ENUM(PartnerRank) | нет | RELIABLE_ASSISTANT | Ранг донора |
| blood_donations | INT | нет | — | Счётчик донаций крови |
| plasma_donations | INT | нет | — | Счётчик донаций плазмы |

Индексы: `donors_title_idx`, `donors_address_idx`, `donors_rank_idx`.


## Перечисления (ENUM)

| Перечисление | Значения |
| UserRole | OWNER, CLINIC, ADMIN |
| SubscriptionPlan | WEEK, MONTH |
| AnimalType | DOG, CAT |
| DogBloodType | DEA_1_1_POS, DEA_1_1_NEG, DEA_1_2, DEA_3, DEA_4, DEA_5, DEA_7 |
| CatBloodType | A, B, AB |
| BloodInventoryStatus | AVAILABLE, RESERVED, USED, EXPIRED |
| ClinicVerificationStatus | PENDING, VERIFIED, REJECTED |
| PartnershipRequestStatus | NEW, IN_REVIEW, APPROVED, REJECTED, ARCHIVED |
| PartnerRank | LEGENDARY_DONOR, RELIABLE_ASSISTANT |
| PartnerType | VETERINARY_CLINIC, SHELTER |
