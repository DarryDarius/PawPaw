import { ApiBlock } from "@/src/types/api";
import { apiRequest, ApiClientOptions } from "./client";

export function createReport(options: ApiClientOptions, input: { targetType: string; targetId: string; reason: string }) {
  return apiRequest<{ id: number; status: string }>("/reports", { method: "POST", body: JSON.stringify(input) }, options);
}

export function getBlocks(options: ApiClientOptions) {
  return apiRequest<{ blocks: ApiBlock[] }>("/blocks", {}, options);
}

export function blockUser(options: ApiClientOptions, blockedUserId: number, reason: string) {
  return apiRequest<{ status: string }>("/blocks", { method: "POST", body: JSON.stringify({ blockedUserId, reason }) }, options);
}

export function unblockUser(options: ApiClientOptions, blockedUserId: number) {
  return apiRequest<{ status: string }>(`/blocks/${blockedUserId}`, { method: "DELETE" }, options);
}
