import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import {
  BloodInventoryStatus,
  BloodProductType,
  ClinicVerificationStatus,
  PlasmaSubtype,
  type BloodCheckInput,
  type BloodSearchInput,
} from "@dobrokot/shared";

const DEFAULT_RADIUS_KM = 50;

export async function checkBlood(input: BloodCheckInput) {
  const where = buildInventoryWhere(input);

  const items = await prisma.bloodInventory.findMany({
    where,
    select: { id: true, unitsCount: true, clinicId: true },
  });

  const matchCount = items.reduce((sum, it) => sum + it.unitsCount, 0);
  const clinicsCount = new Set(items.map((it) => it.clinicId)).size;

  return {
    available: matchCount > 0,
    matchCount,
    clinicsCount,
  };
}

export async function searchClinicsWithBlood(input: BloodSearchInput) {
  const { city, latitude, longitude, radiusKm = DEFAULT_RADIUS_KM, page, limit } = input;
  const inventoryWhere = buildInventoryWhere(input);

  const inventory = await prisma.bloodInventory.findMany({
    where: {
      ...inventoryWhere,
      clinic: {
        verificationStatus: ClinicVerificationStatus.VERIFIED,
        ...(city ? { city: { contains: city } } : {}),
      },
    },
    include: {
      clinic: {
        include: { user: { select: { avatarUrl: true } } },
      },
    },
  });

  type ClinicRow = (typeof inventory)[number]["clinic"] & {
    user: { avatarUrl: string | null };
  };
  type Agg = {
    clinic: ClinicRow;
    productType: BloodProductType;
    plasmaSubtype: PlasmaSubtype | null;
    matchedUnits: number;
    totalVolumeMl: number;
  };

  const aggMap = new Map<string, Agg>();
  for (const item of inventory) {
    const agg = aggMap.get(item.clinicId);
    if (agg) {
      agg.matchedUnits += item.unitsCount;
      agg.totalVolumeMl += item.volumeMl ?? 0;
    } else {
      aggMap.set(item.clinicId, {
        clinic: item.clinic,
        productType: item.productType as BloodProductType,
        plasmaSubtype: (item.plasmaSubtype as PlasmaSubtype | null) ?? null,
        matchedUnits: item.unitsCount,
        totalVolumeMl: item.volumeMl ?? 0,
      });
    }
  }

  let results = Array.from(aggMap.values()).map((agg) => {
    let distance: number | null = null;
    if (
      latitude != null &&
      longitude != null &&
      agg.clinic.latitude != null &&
      agg.clinic.longitude != null
    ) {
      distance = haversineKm(latitude, longitude, agg.clinic.latitude, agg.clinic.longitude);
    }
    return { ...agg, distanceKm: distance };
  });

  if (latitude != null && longitude != null) {
    results = results
      .filter((r) => r.distanceKm == null || r.distanceKm <= radiusKm)
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  } else {
    results.sort((a, b) => b.matchedUnits - a.matchedUnits);
  }

  const total = results.length;
  const start = (page - 1) * limit;
  const paginated = results.slice(start, start + limit);

  return {
    items: paginated.map((r) => ({
      clinic: serializeClinic(r.clinic),
      productType: r.productType,
      plasmaSubtype: r.plasmaSubtype,
      matchedUnits: r.matchedUnits,
      totalVolumeMl: r.totalVolumeMl,
      distanceKm: r.distanceKm,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getClinicWithContacts(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: { user: { select: { avatarUrl: true, name: true, email: true } } },
  });
  if (!clinic) throw new AppError(404, "Клиника не найдена");
  return serializeClinic(clinic, true);
}

export async function getClinicPublicInventory(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) throw new AppError(404, "Клиника не найдена");

  const items = await prisma.bloodInventory.findMany({
    where: { clinicId, status: BloodInventoryStatus.AVAILABLE },
    orderBy: [{ animalType: "asc" }, { bloodType: "asc" }],
  });

  type InventoryGroup = {
    animalType: string;
    bloodType: string;
    productType: BloodProductType;
    plasmaSubtype: PlasmaSubtype | null;
    unitsCount: number;
    totalVolumeMl: number;
  };

  const groups = new Map<string, InventoryGroup>();
  for (const it of items) {
    const subtype = (it.plasmaSubtype as PlasmaSubtype | null) ?? null;
    const key = `${it.animalType}:${it.bloodType}:${it.productType}:${subtype ?? ""}`;
    const g = groups.get(key);
    if (g) {
      g.unitsCount += it.unitsCount;
      g.totalVolumeMl += it.volumeMl ?? 0;
    } else {
      groups.set(key, {
        animalType: it.animalType,
        bloodType: it.bloodType,
        productType: it.productType as BloodProductType,
        plasmaSubtype: subtype,
        unitsCount: it.unitsCount,
        totalVolumeMl: it.volumeMl ?? 0,
      });
    }
  }

  return Array.from(groups.values());
}

function buildInventoryWhere(input: BloodCheckInput) {
  return {
    animalType: input.animalType,
    ...(input.bloodType ? { bloodType: input.bloodType } : {}),
    productType: input.productType,
    ...(input.plasmaSubtype ? { plasmaSubtype: input.plasmaSubtype } : {}),
    status: BloodInventoryStatus.AVAILABLE,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

type ClinicWithUser = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  phone: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  workingHours: string | null;
  licenseNo: string | null;
  verificationStatus: string;
  user: { avatarUrl: string | null };
};

function serializeClinic(
  clinic: ClinicWithUser,
  withSecondaryContacts = false,
) {
  return {
    id: clinic.id,
    userId: clinic.userId,
    title: clinic.title,
    description: clinic.description,
    phone: clinic.phone,
    email: clinic.contactEmail,
    websiteUrl: clinic.websiteUrl,
    address: clinic.address,
    city: clinic.city,
    latitude: clinic.latitude,
    longitude: clinic.longitude,
    workingHours: clinic.workingHours,
    licenseNo: withSecondaryContacts ? clinic.licenseNo : null,
    avatarUrl: clinic.user.avatarUrl,
    verificationStatus: clinic.verificationStatus as ClinicVerificationStatus,
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
