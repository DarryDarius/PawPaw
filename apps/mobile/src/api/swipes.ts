import { apiRequest, ApiClientOptions } from "./client";

export function createSwipe(
  options: ApiClientOptions,
  input: { petId: number; targetPetId: number; action: "like" | "pass"; idempotencyKey: string },
) {
  return apiRequest("/swipes", { method: "POST", body: JSON.stringify(input) }, options);
}
