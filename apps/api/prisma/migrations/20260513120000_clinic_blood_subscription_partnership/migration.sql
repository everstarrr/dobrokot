-- Defensive cleanup: legacy tables existed in older dev branches but were
-- never created by any committed migration. IF EXISTS keeps fresh DBs happy.
DROP TABLE IF EXISTS `DonationResponse`;
DROP TABLE IF EXISTS `DonationRequest`;
DROP TABLE IF EXISTS `Message`;
DROP TABLE IF EXISTS `Animal`;

-- CreateTable User
CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `role` ENUM('OWNER','CLINIC','ADMIN') NOT NULL DEFAULT 'OWNER',
  `city` VARCHAR(191) NULL,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `avatarUrl` VARCHAR(191) NULL,
  `isVerified` BOOLEAN NOT NULL DEFAULT false,
  `subscriptionPlan` ENUM('WEEK','MONTH') NULL,
  `subscriptionExpiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `User_email_key`(`email`),
  INDEX `User_city_idx`(`city`),
  INDEX `User_role_idx`(`role`),
  INDEX `User_subscriptionExpiresAt_idx`(`subscriptionExpiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable RefreshToken
CREATE TABLE IF NOT EXISTS `RefreshToken` (
  `id` VARCHAR(191) NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `RefreshToken_token_key`(`token`),
  INDEX `RefreshToken_userId_idx`(`userId`),
  INDEX `RefreshToken_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `RefreshToken`
  ADD CONSTRAINT `RefreshToken_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Clinic
CREATE TABLE `Clinic` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `phone` VARCHAR(32) NULL,
  `contactEmail` VARCHAR(191) NULL,
  `websiteUrl` VARCHAR(2048) NULL,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `workingHours` VARCHAR(255) NULL,
  `licenseNo` VARCHAR(100) NULL,
  `verificationStatus` ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Clinic_userId_key`(`userId`),
  INDEX `Clinic_city_idx`(`city`),
  INDEX `Clinic_title_idx`(`title`),
  INDEX `Clinic_verificationStatus_idx`(`verificationStatus`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Clinic`
  ADD CONSTRAINT `Clinic_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable BloodInventory
CREATE TABLE `BloodInventory` (
  `id` VARCHAR(191) NOT NULL,
  `clinicId` VARCHAR(191) NOT NULL,
  `animalType` ENUM('DOG','CAT') NOT NULL,
  `bloodType` VARCHAR(20) NOT NULL,
  `volumeMl` DOUBLE NULL,
  `unitsCount` INTEGER NOT NULL DEFAULT 1,
  `donationDate` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NULL,
  `status` ENUM('AVAILABLE','RESERVED','USED','EXPIRED') NOT NULL DEFAULT 'AVAILABLE',
  `notes` TEXT NULL,
  `donorRef` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `BloodInventory_clinicId_idx`(`clinicId`),
  INDEX `BloodInventory_animalType_bloodType_status_idx`(`animalType`,`bloodType`,`status`),
  INDEX `BloodInventory_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `BloodInventory`
  ADD CONSTRAINT `BloodInventory_clinicId_fkey`
  FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable PartnershipRequest
CREATE TABLE `PartnershipRequest` (
  `id` VARCHAR(191) NOT NULL,
  `contactName` VARCHAR(191) NOT NULL,
  `contactEmail` VARCHAR(191) NOT NULL,
  `contactPhone` VARCHAR(32) NULL,
  `clinicTitle` VARCHAR(191) NOT NULL,
  `city` VARCHAR(100) NULL,
  `message` TEXT NULL,
  `status` ENUM('NEW','IN_REVIEW','APPROVED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'NEW',
  `processedAt` DATETIME(3) NULL,
  `processedBy` VARCHAR(191) NULL,
  `provisionedUserId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `PartnershipRequest_status_idx`(`status`),
  INDEX `PartnershipRequest_contactEmail_idx`(`contactEmail`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
