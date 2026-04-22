INSERT INTO `donors` (
  `id`,
  `image_url`,
  `title`,
  `address`,
  `blood_donations`,
  `plasma_donations`
)
VALUES
  (
    '8b44c1d6-6b77-4c18-8ff0-0d3ac5fd75a1',
    '/partners/1_mob.png',
    'Ветклиника Белый Кот',
    'Москва, Цветной бульвар, 11с2',
    24,
    11
  ),
  (
    '3c6e4cf0-d9ad-4ff5-8c2b-90e8d9aa5f32',
    '/partners/2_mob.png',
    'Центр донорства лап',
    'Москва, Ленинградский проспект, 36',
    18,
    14
  ),
  (
    '1a5470d4-552f-4dfd-9077-6eb46e6d9b09',
    '/partners/3_mob.png',
    'Петербургская ветслужба',
    'Санкт-Петербург, Литейный проспект, 57',
    15,
    9
  ),
  (
    '4e2d4939-c9c9-4dd3-9b52-cf5ef62d4bc4',
    '/partners/4_mob.png',
    'Клиника Добрый Пес',
    'Казань, улица Баумана, 44',
    12,
    7
  )
ON DUPLICATE KEY UPDATE
  `image_url` = VALUES(`image_url`),
  `title` = VALUES(`title`),
  `address` = VALUES(`address`),
  `blood_donations` = VALUES(`blood_donations`),
  `plasma_donations` = VALUES(`plasma_donations`);
