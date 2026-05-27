"use client";

import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@dobrokot/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const ACCESS_TOKEN_KEY = "dobrokot:accessToken";
const REFRESH_TOKEN_KEY = "dobrokot:refreshToken";

const isBrowser = typeof window !== "undefined";

export const tokenStorage = {
  getAccess: () => (isBrowser ? localStorage.getItem(ACCESS_TOKEN_KEY) : null),
  getRefresh: () => (isBrowser ? localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  set: (access: string, refresh: string) => {
    if (!isBrowser) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    if (!isBrowser) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );
      const data = response.data as ApiResponse<{ accessToken: string; refreshToken: string }>;
      if (!data.success || !data.data) {
        tokenStorage.clear();
        return null;
      }
      tokenStorage.set(data.data.accessToken, data.data.refreshToken);
      return data.data.accessToken;
    } catch {
      tokenStorage.clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/")
    ) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return apiClient.request(original);
      }
    }
    return Promise.reject(error);
  },
);

export function unwrapApiResponse<T>(response: { data: ApiResponse<T> }): T {
  const { data } = response;
  if (!data.success || data.data === undefined) {
    throw new Error(data.error || data.message || "Ошибка запроса");
  }
  return data.data;
}
