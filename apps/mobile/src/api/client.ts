import { ApiErrorPayload } from "@/src/types/api";
import { defaultApiBaseUrl } from "./config";

export type ApiClientOptions = {
  token?: string | null;
  apiBaseUrl?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  clientOptions: ApiClientOptions = {},
): Promise<T> {
  const apiBaseUrl = clientOptions.apiBaseUrl || defaultApiBaseUrl;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (clientOptions.token) {
    headers.set("Authorization", `Bearer ${clientOptions.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });
  const payload = (await response.json().catch(() => ({}))) as T & ApiErrorPayload;
  if (!response.ok) {
    throw new Error(payload.error?.message || "API request failed");
  }
  return payload;
}

export async function getHealthz() {
  const response = await fetch(defaultApiBaseUrl.replace(/\/api\/v1\/?$/, "/healthz"));
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}
