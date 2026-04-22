import { z } from "zod";
import { RequestStatus, ResponseStatus, Urgency } from "../types";
import { animalTypeSchema } from "./animal";

export { RequestStatus, ResponseStatus, Urgency };

export const urgencySchema = z.nativeEnum(Urgency);
export const requestStatusSchema = z.nativeEnum(RequestStatus);
export const responseStatusSchema = z.nativeEnum(ResponseStatus);

export const createDonationRequestSchema = z.object({
  animalType: animalTypeSchema,
  bloodType: z.string().min(1).max(20),
  urgency: urgencySchema.default(Urgency.NORMAL),
  description: z.string().max(2000).optional(),
  city: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const createDonationResponseSchema = z.object({
  requestId: z.string().uuid(),
  donorAnimalId: z.string().uuid(),
  message: z.string().max(1000).optional(),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export type CreateDonationRequestInput = z.infer<typeof createDonationRequestSchema>;
export type CreateDonationResponseInput = z.infer<typeof createDonationResponseSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
