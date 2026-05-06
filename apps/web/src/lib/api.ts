export type ApiError = { error?: { message?: string } };

export const defaultApiBaseUrl = window.localStorage.getItem("pawpaw-api-base-url") || "http://localhost:8080/api/v1";

export async function apiRequest<T>(apiBaseUrl: string, token: string, path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers
  });
  const payload = (await response.json().catch(() => ({}))) as T & ApiError;
  if (!response.ok) {
    throw new Error(payload?.error?.message || "API request failed");
  }
  return payload;
}

export function saveApiBaseUrl(value: string) {
  window.localStorage.setItem("pawpaw-api-base-url", value);
}
