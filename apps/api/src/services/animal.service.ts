import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import type { CreateAnimalInput, UpdateAnimalInput, SearchDonorsInput } from "@dobrokot/shared";

export async function createAnimal(ownerId: string, data: CreateAnimalInput) {
  return prisma.animal.create({
    data: { ...data, ownerId },
  });
}

export async function getAnimal(animalId: string) {
  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
    include: {
      owner: {
        select: { id: true, name: true, city: true },
      },
    },
  });

  if (!animal) throw new AppError(404, "Животное не найдено");
  return animal;
}

export async function getUserAnimals(ownerId: string) {
  return prisma.animal.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateAnimal(animalId: string, ownerId: string, data: UpdateAnimalInput) {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) throw new AppError(404, "Животное не найдено");
  if (animal.ownerId !== ownerId) throw new AppError(403, "Недостаточно прав");

  return prisma.animal.update({
    where: { id: animalId },
    data,
  });
}

export async function deleteAnimal(animalId: string, ownerId: string) {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) throw new AppError(404, "Животное не найдено");
  if (animal.ownerId !== ownerId) throw new AppError(403, "Недостаточно прав");

  await prisma.animal.delete({ where: { id: animalId } });
}

export async function searchDonors(params: SearchDonorsInput) {
  const { animalType, bloodType, city, latitude, longitude, radiusKm, page, limit } = params;

  const where = {
    isDonor: true as const,
    type: animalType,
    ...(bloodType && { bloodType }),
    ...(city && { owner: { city: { contains: city } } }),
  };

  const [items, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, city: true, latitude: true, longitude: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.animal.count({ where }),
  ]);

  // If coordinates provided, calculate distance and sort
  let results = items.map((animal: typeof items[number]) => {
    let distance: number | null = null;
    if (latitude && longitude && animal.owner.latitude && animal.owner.longitude) {
      distance = haversineKm(latitude, longitude, animal.owner.latitude, animal.owner.longitude);
    }
    return { ...animal, distance };
  });

  if (latitude && longitude) {
    results = results
      .filter((r: typeof results[number]) => r.distance === null || r.distance <= radiusKm)
      .sort((a: typeof results[number], b: typeof results[number]) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }

  return {
    items: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
