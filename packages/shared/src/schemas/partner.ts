import { z } from "zod";
import { PartnerRank, PartnerType } from "../types/index.js";

export { PartnerRank, PartnerType };

export const partnerRankSchema = z.nativeEnum(PartnerRank);
export const partnerTypeSchema = z.nativeEnum(PartnerType);

const nonNegativeInt = z.number().int().min(0);
const optionalSearch = z.string().trim().min(1).max(100).optional();

export const createPartnerSchema = z.object({
  rank: partnerRankSchema,
  title: z.string().trim().min(1).max(191),
  imageUrl: z.string().trim().min(1).max(2048),
  type: partnerTypeSchema,
  bloodDonations: nonNegativeInt,
  plasmaDonations: nonNegativeInt,
});

export const updatePartnerSchema = createPartnerSchema.partial();

export const partnerIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listPartnersQuerySchema = z.object({
  rank: partnerRankSchema.optional(),
  type: partnerTypeSchema.optional(),
  search: optionalSearch,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const createDonorSchema = z.object({
  imageUrl: z.string().trim().min(1).max(2048),
  title: z.string().trim().min(1).max(191),
  address: z.string().trim().min(1).max(191),
  rank: partnerRankSchema.optional(),
  bloodDonations: nonNegativeInt,
  plasmaDonations: nonNegativeInt,
});

export const updateDonorSchema = createDonorSchema.partial();

export const donorIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listDonorsQuerySchema = z.object({
  rank: partnerRankSchema.optional(),
  search: optionalSearch,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type ListPartnersQueryInput = z.infer<typeof listPartnersQuerySchema>;
export type CreateDonorInput = z.infer<typeof createDonorSchema>;
export type UpdateDonorInput = z.infer<typeof updateDonorSchema>;
export type ListDonorsQueryInput = z.infer<typeof listDonorsQuerySchema>;
