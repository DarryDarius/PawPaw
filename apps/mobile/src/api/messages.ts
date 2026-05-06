import { ApiMessage } from "@/src/types/api";
import { apiRequest, ApiClientOptions } from "./client";

export function getMessages(options: ApiClientOptions, conversationId: number) {
  return apiRequest<{ messages: ApiMessage[] }>(`/conversations/${conversationId}/messages`, {}, options);
}

export function sendMessage(options: ApiClientOptions, conversationId: number, body: string) {
  return apiRequest<{ message: ApiMessage }>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  }, options);
}
