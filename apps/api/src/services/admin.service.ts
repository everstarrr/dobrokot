import bcrypt from "bcrypt";
import {
  ClinicVerificationStatus,
  UserRole,
  type CreateClinicAccountInput,
} from "@dobrokot/shared";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

const SALT_ROUNDS = 12;

export async function createClinicAccount(input: CreateClinicAccountInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, "Пользователь с таким email уже существует");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        phone: input.phone,
        role: UserRole.CLINIC,
        city: input.clinic.city,
        isVerified: true,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    const clinic = await tx.clinic.create({
      data: {
        userId: user.id,
        title: input.clinic.title,
        description: input.clinic.description,
        phone: input.clinic.phone ?? input.phone,
        contactEmail: input.clinic.contactEmail ?? input.email,
        websiteUrl: input.clinic.websiteUrl,
        address: input.clinic.address,
        city: input.clinic.city,
        latitude: input.clinic.latitude,
        longitude: input.clinic.longitude,
        workingHours: input.clinic.workingHours,
        licenseNo: input.clinic.licenseNo,
        verificationStatus:
          input.clinic.verificationStatus ?? ClinicVerificationStatus.VERIFIED,
      },
    });

    return { user, clinic };
  });

  return {
    user: created.user,
    clinic: created.clinic,
  };
}
