const DEFAULT_API_BASE_URL = "https://prn232.onrender.com/api";

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const rawUseMockApi = process.env.EXPO_PUBLIC_USE_MOCK_API?.trim();

export const API_BASE_URL = (rawApiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/$/, "");
export const USE_MOCK_API = rawUseMockApi === "true";
export const API_TIMEOUT_MS = 60_000;
