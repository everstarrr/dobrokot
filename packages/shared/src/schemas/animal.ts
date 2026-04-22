import { z } from "zod";
import { AnimalType, CatBloodType, DogBloodType } from "../types";

export { AnimalType, CatBloodType, DogBloodType };

export const animalTypeSchema = z.nativeEnum(AnimalType);
export const dogBloodTypeSchema = z.nativeEnum(DogBloodType);
export const catBloodTypeSchema = z.nativeEnum(CatBloodType);

export const createAnimalSchema = z
  .object({
    name: z.string().min(1, "Кличка обязательна").max(100),
    type: animalTypeSchema,
    breed: z.string().max(100).optional(),
    weight: z.number().positive("Вес должен быть положительным").optional(),
    age: z.number().int().min(0).max(360).optional(),
    bloodType: z.string().max(20).optional(),
    isDonor: z.boolean().default(false),
    isVaccinated: z.boolean().default(false),
    healthNotes: z.string().max(2000).optional(),
  })
  .refine(
    (data) => {
      if (!data.bloodType) return true;
      if (data.type === AnimalType.DOG) {
        return dogBloodTypeSchema.safeParse(data.bloodType).success;
      }
      if (data.type === AnimalType.CAT) {
        return catBloodTypeSchema.safeParse(data.bloodType).success;
      }
      return false;
    },
    {
      message: "Некорректная группа крови для данного типа животного",
      path: ["bloodType"],
    }
  );

export const updateAnimalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  breed: z.string().max(100).optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  age: z.number().int().min(0).max(360).optional().nullable(),
  bloodType: z.string().max(20).optional().nullable(),
  isDonor: z.boolean().optional(),
  isVaccinated: z.boolean().optional(),
  healthNotes: z.string().max(2000).optional().nullable(),
});

export const searchDonorsSchema = z.object({
  animalType: animalTypeSchema,
  bloodType: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().positive().max(500).default(50),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;
export type SearchDonorsInput = z.infer<typeof searchDonorsSchema>;
