import { z } from "zod";
import { ClinicVerificationStatus } from "../types";

export { ClinicVerificationStatus };

export const clinicVerificationStatusSchema = z.nativeEnum(ClinicVerificationStatus);

export const updateClinicProfileSchema = z.object({
  title: z.string().trim().min(1).max(191).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/)
    .optional()
    .nullable(),
  contactEmail: z.string().trim().email().max(191).optional().nullable(),
  websiteUrl: z.string().trim().url().max(2048).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  workingHours: z.string().trim().max(255).optional().nullable(),
  licenseNo: z.string().trim().max(100).optional().nullable(),
});

export const createClinicAccountSchema = z.object({
  email: z.string().trim().email().max(191),
  name: z.string().trim().min(1).max(100),
  password: z.string().min(8).max(128),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/)
    .optional(),
  clinic: z.object({
    title: z.string().trim().min(1).max(191),
    description: z.string().trim().max(5000).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{10,15}$/)
      .optional(),
    contactEmail: z.string().trim().email().max(191).optional(),
    websiteUrl: z.string().trim().url().max(2048).optional(),
    address: z.string().trim().max(255).optional(),
    city: z.string().trim().max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    workingHours: z.string().trim().max(255).optional(),
    licenseNo: z.string().trim().max(100).optional(),
    verificationStatus: clinicVerificationStatusSchema.optional(),
  }),
});

export type UpdateClinicProfileInput = z.infer<typeof updateClinicProfileSchema>;
export type CreateClinicAccountInput = z.infer<typeof createClinicAccountSchema>;
