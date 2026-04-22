import { useQuery } from "@tanstack/react-query";
import type { Donor, PaginatedResponse } from "@dobrokot/shared";
import type { AxiosRequestConfig } from "axios";
import { apiClient, unwrapApiResponse } from "./http";

export interface GetDonorsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const donorsQueryKey = (params: GetDonorsParams = {}) => ["donors", params] as const;

export async function getDonors(
  params: GetDonorsParams = {},
  config?: AxiosRequestConfig
): Promise<PaginatedResponse<Donor>> {
  const response = await apiClient.get("/donors", {
    ...config,
    params: {
      page: 1,
      limit: 24,
      ...params,
    },
  });

  return unwrapApiResponse<PaginatedResponse<Donor>>(response);
}

export function useDonorsQuery(params: GetDonorsParams = {}) {
  const normalizedParams = {
    page: 1,
    limit: 24,
    ...params,
    search: params.search?.trim() || undefined,
  };

  return useQuery({
    queryKey: donorsQueryKey(normalizedParams),
    queryFn: () => getDonors(normalizedParams),
    staleTime: 30_000,
  });
}
