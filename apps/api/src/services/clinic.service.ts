import {
  BloodInventoryStatus,
  ClinicVerificationStatus,
  type BulkBloodInventoryInput,
  type CreateBloodInventoryInput,
  type ListBloodInventoryQueryInput,
  type UpdateBloodInventoryInput,
  type UpdateClinicProfileInput,
} from "@dobrokot/shared";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

async function getOrCreateMyClinic(userId: string) {
  let clinic = await prisma.clinic.findUnique({ where: { userId } });
  if (!clinic) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, city: true, email: true, phone: true },
    });
    if (!user) throw new AppError(404, "Пользователь не найден");
    clinic = await prisma.clinic.create({
      data: {
        userId,
        title: user.name,
        city: user.city,
        contactEmail: user.email,
        phone: user.phone,
        verificationStatus: ClinicVerificationStatus.PENDING,
      },
    });
  }
  return clinic;
}

export async function getMyProfile(userId: string) {
  const clinic = await getOrCreateMyClinic(userId);
  return clinic;
}

export async function updateMyProfile(userId: string, input: UpdateClinicProfileInput) {
  await getOrCreateMyClinic(userId);
  return prisma.clinic.update({
    where: { userId },
    data: input,
  });
}

async function getMyClinicOrFail(userId: string) {
  const clinic = await prisma.clinic.findUnique({ where: { userId } });
  if (!clinic) throw new AppError(404, "Профиль клиники не найден");
  return clinic;
}

export async function listMyInventory(userId: string, filters: ListBloodInventoryQueryInput) {
  const clinic = await getMyClinicOrFail(userId);
  const { animalType, bloodType, status, page, limit } = filters;

  const where = {
    clinicId: clinic.id,
    ...(animalType ? { animalType } : {}),
    ...(bloodType ? { bloodType } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.bloodInventory.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bloodInventory.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createInventory(userId: string, input: CreateBloodInventoryInput) {
  const clinic = await getMyClinicOrFail(userId);
  return prisma.bloodInventory.create({
    data: {
      clinicId: clinic.id,
      animalType: input.animalType,
      bloodType: input.bloodType,
      volumeMl: input.volumeMl,
      unitsCount: input.unitsCount,
      donationDate: input.donationDate,
      expiresAt: input.expiresAt,
      status: input.status,
      notes: input.notes,
      donorRef: input.donorRef,
    },
  });
}

export async function bulkCreateInventory(userId: string, input: BulkBloodInventoryInput) {
  const clinic = await getMyClinicOrFail(userId);
  const data = input.items.map((item) => ({
    clinicId: clinic.id,
    animalType: item.animalType,
    bloodType: item.bloodType,
    volumeMl: item.volumeMl,
    unitsCount: item.unitsCount,
    donationDate: item.donationDate,
    expiresAt: item.expiresAt,
    status: item.status,
    notes: item.notes,
    donorRef: item.donorRef,
  }));
  const result = await prisma.bloodInventory.createMany({ data });
  return { created: result.count };
}

export async function updateInventory(
  userId: string,
  inventoryId: string,
  input: UpdateBloodInventoryInput,
) {
  const clinic = await getMyClinicOrFail(userId);
  const item = await prisma.bloodInventory.findUnique({ where: { id: inventoryId } });
  if (!item || item.clinicId !== clinic.id) {
    throw new AppError(404, "Запись инвентаря не найдена");
  }
  return prisma.bloodInventory.update({
    where: { id: inventoryId },
    data: input,
  });
}

export async function deleteInventory(userId: string, inventoryId: string) {
  const clinic = await getMyClinicOrFail(userId);
  const item = await prisma.bloodInventory.findUnique({ where: { id: inventoryId } });
  if (!item || item.clinicId !== clinic.id) {
    throw new AppError(404, "Запись инвентаря не найдена");
  }
  await prisma.bloodInventory.delete({ where: { id: inventoryId } });
}

export async function markExpiredInventory() {
  const result = await prisma.bloodInventory.updateMany({
    where: {
      status: BloodInventoryStatus.AVAILABLE,
      expiresAt: { lt: new Date() },
    },
    data: { status: BloodInventoryStatus.EXPIRED },
  });
  return { updated: result.count };
}
