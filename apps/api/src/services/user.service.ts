import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import type { UpdateProfileInput } from "@dobrokot/shared";

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      city: true,
      latitude: true,
      longitude: true,
      avatarUrl: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError(404, "Пользователь не найден");
  return user;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      city: true,
      latitude: true,
      longitude: true,
      avatarUrl: true,
    },
  });
}

export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      city: true,
      avatarUrl: true,
      createdAt: true,
      animals: {
        where: { isDonor: true },
        select: {
          id: true,
          name: true,
          type: true,
          breed: true,
          bloodType: true,
        },
      },
    },
  });

  if (!user) throw new AppError(404, "Пользователь не найден");
  return user;
}
