"use client";

import {
  AnimalType,
  CatBloodType,
  DogBloodType,
  type BloodCheckInput,
  type BloodSearchClinicResult,
  type PaginatedResponse,
} from "@dobrokot/shared";
import { apiClient, unwrapApiResponse } from "./http";

export type BloodCheckResult = {
  available: boolean;
  matchCount: number;
  clinicsCount: number;
};

export type BloodSearchInputClient = {
  animalType: AnimalType;
  bloodType?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
};

export async function checkBlood(input: BloodCheckInput): Promise<BloodCheckResult> {
  const response = await apiClient.post("/blood/check", input);
  return unwrapApiResponse<BloodCheckResult>(response);
}

export async function searchBlood(
  input: BloodSearchInputClient,
): Promise<PaginatedResponse<BloodSearchClinicResult>> {
  const response = await apiClient.post("/blood/search", {
    page: 1,
    limit: 24,
    ...input,
  });
  return unwrapApiResponse<PaginatedResponse<BloodSearchClinicResult>>(response);
}

export const bloodTypeOptionsByAnimal: Record<
  AnimalType,
  { value: string; label: string }[]
> = {
  [AnimalType.CAT]: [
    { value: CatBloodType.A, label: "A" },
    { value: CatBloodType.B, label: "B" },
    { value: CatBloodType.AB, label: "AB" },
  ],
  [AnimalType.DOG]: [
    { value: DogBloodType.DEA_1_1_POS, label: "DEA 1.1+" },
    { value: DogBloodType.DEA_1_1_NEG, label: "DEA 1.1−" },
    { value: DogBloodType.DEA_1_2, label: "DEA 1.2" },
    { value: DogBloodType.DEA_3, label: "DEA 3" },
    { value: DogBloodType.DEA_4, label: "DEA 4" },
    { value: DogBloodType.DEA_5, label: "DEA 5" },
    { value: DogBloodType.DEA_7, label: "DEA 7" },
  ],
};
