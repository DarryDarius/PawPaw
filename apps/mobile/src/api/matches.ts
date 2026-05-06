import { ApiMatch } from "@/src/types/api";
import { apiRequest, ApiClientOptions } from "./client";

export function getMatches(options: ApiClientOptions) {
  return apiRequest<{ matches: ApiMatch[] }>("/matches", {}, options);
}

export function unmatch(options: ApiClientOptions, matchId: number) {
  return apiRequest<{ status: string }>(`/matches/${matchId}/unmatch`, { method: "POST", body: "{}" }, options);
}
