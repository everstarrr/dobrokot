"use client";

import { SubscriptionPlan, type SubscriptionState } from "@dobrokot/shared";
import { apiClient, unwrapApiResponse } from "./http";

export { SubscriptionPlan };

export async function fetchSubscription(): Promise<SubscriptionState> {
  const response = await apiClient.get("/subscription/me");
  return unwrapApiResponse<SubscriptionState>(response);
}

export async function activateSubscription(
  plan: SubscriptionPlan,
): Promise<SubscriptionState> {
  const response = await apiClient.post("/subscription/activate", { plan });
  return unwrapApiResponse<SubscriptionState>(response);
}
