import { z } from "zod";
import { PartnershipRequestStatus } from "../types/index.js";

export { PartnershipRequestStatus };

export const partnershipRequestStatusSchema = z.nativeEnum(PartnershipRequestStatus);

export const createPartnershipRequestSchema = z.object({
  contactName: z.string().trim().min(1).max(191),
  contactEmail: z.string().trim().email().max(191),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Некорректный номер телефона")
    .optional(),
  clinicTitle: z.string().trim().min(1).max(191),
  city: z.string().trim().max(100).optional(),
  message: z.string().trim().max(2000).optional(),
});

export const listPartnershipRequestsQuerySchema = z.object({
  status: partnershipRequestStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updatePartnershipRequestSchema = z.object({
  status: partnershipRequestStatusSchema,
});

export const partnershipRequestIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const provisionClinicFromRequestSchema = z.object({
  password: z.string().min(8).max(128),
});

export type CreatePartnershipRequestInput = z.infer<typeof createPartnershipRequestSchema>;
export type ListPartnershipRequestsQueryInput = z.infer<typeof listPartnershipRequestsQuerySchema>;
export type UpdatePartnershipRequestInput = z.infer<typeof updatePartnershipRequestSchema>;
export type ProvisionClinicFromRequestInput = z.infer<typeof provisionClinicFromRequestSchema>;
