import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import type {
  CreateDonorInput,
  CreatePartnerInput,
  Donor,
  ListDonorsQueryInput,
  ListPartnersQueryInput,
  PaginatedResponse,
  Partner,
  PartnerRank,
  PartnerType,
  UpdateDonorInput,
  UpdatePartnerInput,
} from "@dobrokot/shared";

export async function getPartners(query: ListPartnersQueryInput) {
  const { rank, type, search, page, limit } = query;
  const where = {
    ...(rank && { rank }),
    ...(type && { type }),
    ...(search && {
      OR: [{ title: { contains: search } }],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { rank: "asc" },
        { bloodDonations: "desc" },
        { plasmaDonations: "desc" },
        { title: "asc" },
      ],
    }),
    prisma.partner.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      rank: item.rank as PartnerRank,
      type: item.type as PartnerType,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  } satisfies PaginatedResponse<Partner>;
}

export async function getPartner(id: number) {
  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner) throw new AppError(404, "Партнер не найден");
  return partner;
}

export async function createPartner(data: CreatePartnerInput) {
  return prisma.partner.create({ data });
}

export async function updatePartner(id: number, data: UpdatePartnerInput) {
  await getPartner(id);
  return prisma.partner.update({
    where: { id },
    data,
  });
}

export async function deletePartner(id: number) {
  await getPartner(id);
  await prisma.partner.delete({ where: { id } });
}

export async function getDonors(query: ListDonorsQueryInput) {
  const { search, page, limit } = query;
  const where = {
    ...(search && {
      OR: [{ title: { contains: search } }, { address: { contains: search } }],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.donor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { bloodDonations: "desc" },
        { plasmaDonations: "desc" },
        { title: "asc" },
      ],
    }),
    prisma.donor.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  } satisfies PaginatedResponse<Donor>;
}

export async function getDonor(id: string) {
  const donor = await prisma.donor.findUnique({ where: { id } });
  if (!donor) throw new AppError(404, "Донор не найден");
  return donor;
}

export async function createDonor(data: CreateDonorInput) {
  return prisma.donor.create({ data });
}

export async function updateDonor(id: string, data: UpdateDonorInput) {
  await getDonor(id);
  return prisma.donor.update({
    where: { id },
    data,
  });
}

export async function deleteDonor(id: string) {
  await getDonor(id);
  await prisma.donor.delete({ where: { id } });
}
