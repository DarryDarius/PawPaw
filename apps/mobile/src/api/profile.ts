import { ApiMe } from "@/src/types/api";
import { apiRequest, ApiClientOptions } from "./client";

export function getMe(options: ApiClientOptions) {
  return apiRequest<ApiMe>("/me", {}, options);
}

export function updateMe(options: ApiClientOptions, input: Record<string, unknown>) {
  return apiRequest<ApiMe>("/me", { method: "PATCH", body: JSON.stringify(input) }, options);
}
