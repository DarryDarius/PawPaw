import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

export const defaultApiBaseUrl =
  extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api/v1";

export const healthzUrl = defaultApiBaseUrl.replace(/\/api\/v1\/?$/, "/healthz");
