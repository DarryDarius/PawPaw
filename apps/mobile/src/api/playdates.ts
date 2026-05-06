import { ApiLocation, ApiPlaydate } from "@/src/types/api";
import { apiRequest, ApiClientOptions } from "./client";

export function getLocations(options: ApiClientOptions) {
  return apiRequest<{ locations: ApiLocation[] }>("/locations", {}, options);
}

export function getPlaydates(options: ApiClientOptions) {
  return apiRequest<{ playdates: ApiPlaydate[] }>("/playdates", {}, options);
}

export function createPlaydate(options: ApiClientOptions, input: Record<string, unknown>) {
  return apiRequest<{ playdate: ApiPlaydate }>("/playdates", { method: "POST", body: JSON.stringify(input) }, options);
}

export function updatePlaydate(options: ApiClientOptions, playdateId: number, action: "respond" | "cancel" | "check-in", status?: string) {
  const path = action === "respond" ? `/playdates/${playdateId}/respond` : `/playdates/${playdateId}/${action}`;
  return apiRequest(path, { method: "POST", body: JSON.stringify(status ? { status } : {}) }, options);
}
