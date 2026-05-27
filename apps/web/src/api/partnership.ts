"use client";

import type { CreatePartnershipRequestInput } from "@dobrokot/shared";
import { apiClient, unwrapApiResponse } from "./http";

export type PartnershipRequestPayload = CreatePartnershipRequestInput;

export async function submitPartnershipRequest(
  input: PartnershipRequestPayload,
): Promise<{ id: string }> {
  const response = await apiClient.post("/partnership/requests", input);
  return unwrapApiResponse<{ id: string }>(response);
}
