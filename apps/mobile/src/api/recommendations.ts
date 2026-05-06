import { ApiRecommendation } from "@/src/types/api";
import { apiRequest, ApiClientOptions } from "./client";

export function getRecommendations(options: ApiClientOptions) {
  return apiRequest<{ recommendations: ApiRecommendation[] }>("/recommendations/feed", {}, options);
}
