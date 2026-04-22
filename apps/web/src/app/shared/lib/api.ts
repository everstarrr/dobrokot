const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function api<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...rest,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Ошибка запроса");
  }

  return json.data as T;
}
