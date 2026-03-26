import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "../constants/env";
import { clearAuthSession, getAccessToken, getRefreshToken, saveAuthSession } from "./authSession";
import type { ApiResponse } from "./apiTypes";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

interface RefreshTokenPayload {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenData {
  accessToken: string;
  refreshToken?: string;
}

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    try {
      const response = await axios.post<ApiResponse<RefreshTokenData>>(
        `${API_BASE_URL}/auth/refresh-token`,
        {
          accessToken,
          refreshToken,
        } satisfies RefreshTokenPayload,
        {
          timeout: API_TIMEOUT_MS,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const nextSession = response.data.data;
      await saveAuthSession(nextSession.accessToken, nextSession.refreshToken ?? refreshToken);
      return nextSession.accessToken;
    } catch (error) {
      await clearAuthSession();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

http.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const nextAccessToken = await refreshAccessToken();

        if (nextAccessToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
          return http(originalRequest);
        }
      } catch {
        await clearAuthSession();
      }
    }

    return Promise.reject(error);
  },
);

export default http;
