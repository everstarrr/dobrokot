-- DropForeignKey
ALTER TABLE `Animal` DROP FOREIGN KEY `Animal_ownerId_fkey`;
ALTER TABLE `DonationRequest` DROP FOREIGN KEY `DonationRequest_requesterId_fkey`;
ALTER TABLE `DonationResponse` DROP FOREIGN KEY `DonationResponse_requestId_fkey`;
ALTER TABLE `DonationResponse` DROP FOREIGN KEY `DonationResponse_donorAnimalId_fkey`;
ALTER TABLE `Message` DROP FOREIGN KEY `Message_senderId_fkey`;
ALTER TABLE `Message` DROP FOREIGN KEY `Message_receiverId_fkey`;

-- DropTable (legacy)
DROP TABLE IF EXISTS `DonationResponse`;
DROP TABLE IF EXISTS `DonationRequest`;
DROP TABLE IF EXISTS `Message`;
DROP TABLE IF EXISTS `Animal`;

-- AlterTable User: subscription fields + tighten role enum
ALTER TABLE `User`
  ADD COLUMN `subscriptionPlan` ENUM('WEEK','MONTH') NULL,
  ADD COLUMN `subscriptionExpiresAt` DATETIME(3) NULL,
  MODIFY `role` ENUM('OWNER','CLINIC','ADMIN') NOT NULL DEFAULT 'OWNER';

CREATE INDEX `User_subscriptionExpiresAt_idx` ON `User`(`subscriptionExpiresAt`);

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
