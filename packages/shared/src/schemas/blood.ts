import { z } from "zod";
import {
  AnimalType,
  BloodInventoryStatus,
  CatBloodType,
  DogBloodType,
} from "../types";

export { AnimalType, BloodInventoryStatus, CatBloodType, DogBloodType };

export const animalTypeSchema = z.nativeEnum(AnimalType);
export const bloodInventoryStatusSchema = z.nativeEnum(BloodInventoryStatus);

const bloodTypeForAnimal = (type: AnimalType, bloodType: string) => {
  if (type === AnimalType.DOG) return z.nativeEnum(DogBloodType).safeParse(bloodType).success;
  if (type === AnimalType.CAT) return z.nativeEnum(CatBloodType).safeParse(bloodType).success;
  return false;
};

export const bloodCheckSchema = z
  .object({
    animalType: animalTypeSchema,
    bloodType: z.string().trim().max(20).optional(),
  })
  .refine(
    (data) => !data.bloodType || bloodTypeForAnimal(data.animalType, data.bloodType),
    { message: "Некорректная группа крови для данного вида", path: ["bloodType"] }
  );

export const bloodSearchSchema = z
  .object({
    animalType: animalTypeSchema,
    bloodType: z.string().trim().max(20).optional(),
    city: z.string().trim().max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radiusKm: z.number().positive().max(500).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
  })
  .refine(
    (data) => !data.bloodType || bloodTypeForAnimal(data.animalType, data.bloodType),
    { message: "Некорректная группа крови для данного вида", path: ["bloodType"] }
  );

export const clinicIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createBloodInventorySchema = z
  .object({
    animalType: animalTypeSchema,
    bloodType: z.string().trim().min(1).max(20),
    volumeMl: z.number().positive().max(10000).optional(),
    unitsCount: z.number().int().positive().max(1000).default(1),
    donationDate: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
    status: bloodInventoryStatusSchema.default(BloodInventoryStatus.AVAILABLE),
    notes: z.string().max(2000).optional(),
    donorRef: z.string().trim().max(191).optional(),
  })
  .refine(
    (data) => bloodTypeForAnimal(data.animalType, data.bloodType),
    { message: "Некорректная группа крови для данного вида", path: ["bloodType"] }
  );

export const updateBloodInventorySchema = z.object({
  volumeMl: z.number().positive().max(10000).optional().nullable(),
  unitsCount: z.number().int().positive().max(1000).optional(),
  donationDate: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  status: bloodInventoryStatusSchema.optional(),
  notes: z.string().max(2000).optional().nullable(),
  donorRef: z.string().trim().max(191).optional().nullable(),
});

export const bulkBloodInventorySchema = z.object({
  items: z.array(createBloodInventorySchema).min(1).max(500),
});

export const listBloodInventoryQuerySchema = z.object({
  animalType: animalTypeSchema.optional(),
  bloodType: z.string().trim().max(20).optional(),
  status: bloodInventoryStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const bloodInventoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type BloodCheckInput = z.infer<typeof bloodCheckSchema>;
export type BloodSearchInput = z.infer<typeof bloodSearchSchema>;
export type CreateBloodInventoryInput = z.infer<typeof createBloodInventorySchema>;
export type UpdateBloodInventoryInput = z.infer<typeof updateBloodInventorySchema>;
export type BulkBloodInventoryInput = z.infer<typeof bulkBloodInventorySchema>;
export type ListBloodInventoryQueryInput = z.infer<typeof listBloodInventoryQuerySchema>;
