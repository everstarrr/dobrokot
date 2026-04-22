-- CreateTable
CREATE TABLE `partners` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `rank` ENUM('LEGENDARY_DONOR', 'RELIABLE_ASSISTANT') NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `image_url` VARCHAR(191) NOT NULL,
  `type` ENUM('VETERINARY_CLINIC', 'SHELTER') NOT NULL,
  `blood_donations` INTEGER NOT NULL,
  `plasma_donations` INTEGER NOT NULL,

  INDEX `partners_rank_idx`(`rank`),
  INDEX `partners_type_idx`(`type`),
  INDEX `partners_title_idx`(`title`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donors` (
  `id` VARCHAR(191) NOT NULL,
  `image_url` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `blood_donations` INTEGER NOT NULL,
  `plasma_donations` INTEGER NOT NULL,

  INDEX `donors_title_idx`(`title`),
  INDEX `donors_address_idx`(`address`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
