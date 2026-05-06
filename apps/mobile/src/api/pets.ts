import { ApiPet } from "@/src/types/api";
import { apiRequest, ApiClientOptions } from "./client";

export function createPet(options: ApiClientOptions, input: Record<string, unknown>) {
  return apiRequest<{ pet: ApiPet }>("/pets", { method: "POST", body: JSON.stringify(input) }, options);
}

export function getMyPets(options: ApiClientOptions) {
  return apiRequest<{ pets: ApiPet[] }>("/me/pets", {}, options);
}
