"use client";

import type { LoginInput, RegisterInput, UserRole } from "@dobrokot/shared";
import { apiClient, tokenStorage, unwrapApiResponse } from "./http";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type AuthPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const response = await apiClient.post("/auth/register", input);
  const data = unwrapApiResponse<AuthPayload>(response);
  tokenStorage.set(data.accessToken, data.refreshToken);
  return data.user;
}

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const response = await apiClient.post("/auth/login", input);
  const data = unwrapApiResponse<AuthPayload>(response);
  tokenStorage.set(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logoutUser(): Promise<void> {
  const refreshToken = tokenStorage.getRefresh();
  try {
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refreshToken });
    }
  } finally {
    tokenStorage.clear();
  }
}
