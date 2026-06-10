-- Add product type (whole blood / plasma) and plasma subtype to BloodInventory.
ALTER TABLE `BloodInventory`
  ADD COLUMN `productType` ENUM('BLOOD', 'PLASMA') NOT NULL DEFAULT 'BLOOD',
  ADD COLUMN `plasmaSubtype` ENUM('FFP', 'FP', 'CRYO') NULL;

-- Replace the existing search index so it covers productType too.
DROP INDEX `BloodInventory_animalType_bloodType_status_idx` ON `BloodInventory`;
CREATE INDEX `BloodInventory_animalType_bloodType_productType_status_idx`
  ON `BloodInventory` (`animalType`, `bloodType`, `productType`, `status`);

-- Promote a couple of seeded positions to PLASMA so the new filter has data.
UPDATE `BloodInventory`
   SET `productType` = 'PLASMA',
       `plasmaSubtype` = 'FFP'
 WHERE `id` IN (
   '00000000-0000-0000-0000-00000000b002',
   '00000000-0000-0000-0000-00000000b005'
 );
