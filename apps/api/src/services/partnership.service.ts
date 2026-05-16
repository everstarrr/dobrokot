import bcrypt from "bcrypt";
import {
  ClinicVerificationStatus,
  PartnershipRequestStatus,
  UserRole,
  type CreatePartnershipRequestInput,
  type ListPartnershipRequestsQueryInput,
  type ProvisionClinicFromRequestInput,
  type UpdatePartnershipRequestInput,
} from "@dobrokot/shared";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

const SALT_ROUNDS = 12;

export async function createRequest(input: CreatePartnershipRequestInput) {
  return prisma.partnershipRequest.create({ data: input });
}

export async function listRequests(filters: ListPartnershipRequestsQueryInput) {
  const { status, page, limit } = filters;
  const where = { ...(status ? { status } : {}) };

  const [items, total] = await Promise.all([
    prisma.partnershipRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.partnershipRequest.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getRequest(id: string) {
  const request = await prisma.partnershipRequest.findUnique({ where: { id } });
  if (!request) throw new AppError(404, "Заявка не найдена");
  return request;
}

export async function updateRequestStatus(
  id: string,
  adminId: string,
  input: UpdatePartnershipRequestInput,
) {
  await getRequest(id);
  return prisma.partnershipRequest.update({
    where: { id },
    data: {
      status: input.status,
      processedBy: adminId,
      processedAt: new Date(),
    },
  });
}

export async function provisionClinicFromRequest(
  id: string,
  adminId: string,
  input: ProvisionClinicFromRequestInput,
) {
  const request = await getRequest(id);

  if (request.provisionedUserId) {
    throw new AppError(409, "Аккаунт уже создан для этой заявки");
  }

  const existing = await prisma.user.findUnique({ where: { email: request.contactEmail } });
  if (existing) {
    throw new AppError(409, "Пользователь с таким email уже существует");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: request.contactEmail,
        passwordHash,
        name: request.contactName,
        phone: request.contactPhone ?? null,
        role: UserRole.CLINIC,
        city: request.city ?? null,
        isVerified: true,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    const clinic = await tx.clinic.create({
      data: {
        userId: user.id,
        title: request.clinicTitle,
        city: request.city ?? null,
        contactEmail: request.contactEmail,
        phone: request.contactPhone ?? null,
        verificationStatus: ClinicVerificationStatus.VERIFIED,
      },
    });

    await tx.partnershipRequest.update({
      where: { id: request.id },
      data: {
        status: PartnershipRequestStatus.APPROVED,
        processedAt: new Date(),
        processedBy: adminId,
        provisionedUserId: user.id,
      },
    });

    return { user, clinic };
  });

  return {
    user: created.user,
    clinic: created.clinic,
  };
}
