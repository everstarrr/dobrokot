import { z } from "zod";
import { UserRole } from "../types/index.js";

export { UserRole };

export const userRoleSchema = z.nativeEnum(UserRole);

export const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z
    .string()
    .min(8, "Пароль должен быть не менее 8 символов")
    .max(128),
  name: z.string().min(1, "Имя обязательно").max(100),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Некорректный номер телефона")
    .optional(),
  city: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/)
    .optional()
    .nullable(),
  city: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
