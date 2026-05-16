import { z } from "zod";
import { SubscriptionPlan } from "../types";

export { SubscriptionPlan };

export const subscriptionPlanSchema = z.nativeEnum(SubscriptionPlan);

export const activateSubscriptionSchema = z.object({
  plan: subscriptionPlanSchema,
});

export type ActivateSubscriptionInput = z.infer<typeof activateSubscriptionSchema>;
