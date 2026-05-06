import { apiRequest } from "./client";
import { ApiUser } from "@/src/types/api";

export type LoginInput = {
  email: string;
  nickname?: string;
  neighborhood?: string;
  avatarUrl?: string;
};

export type LoginResponse = {
  user: ApiUser;
  session: {
    token: string;
    expiresAt: string;
  };
};

export function login(input: LoginInput) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout(token: string) {
  return apiRequest<{ status: string }>("/auth/logout", { method: "POST", body: "{}" }, { token });
}
