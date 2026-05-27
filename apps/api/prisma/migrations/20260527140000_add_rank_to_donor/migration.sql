-- Add `rank` to donors so the "Наши результаты" cards can show
-- "Легендарный донор" / "Надежный помощник" badges from data.
ALTER TABLE `donors`
  ADD COLUMN `rank` ENUM('LEGENDARY_DONOR', 'RELIABLE_ASSISTANT')
    NOT NULL DEFAULT 'RELIABLE_ASSISTANT';

CREATE INDEX `donors_rank_idx` ON `donors`(`rank`);

-- Promote the top contributors so the badge variety is visible.
UPDATE `donors`
   SET `rank` = 'LEGENDARY_DONOR'
 WHERE `id` IN (
   '8b44c1d6-6b77-4c18-8ff0-0d3ac5fd75a1', -- Ветклиника Белый Кот
   '3c6e4cf0-d9ad-4ff5-8c2b-90e8d9aa5f32'  -- Центр донорства лап
 );
