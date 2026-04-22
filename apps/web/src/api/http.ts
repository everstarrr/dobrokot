import axios from "axios";
import type { ApiResponse } from "@dobrokot/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function unwrapApiResponse<T>(response: { data: ApiResponse<T> }): T {
  const { data } = response;

  if (!data.success || data.data === undefined) {
    throw new Error(data.error || data.message || "Ошибка запроса");
  }

  return data.data;
}
