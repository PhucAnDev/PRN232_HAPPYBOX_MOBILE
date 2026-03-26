import http from "./http";
import type { ApiResponse } from "./apiTypes";

export interface UserAuthInfo {
  id: string;
  email: string;
  fullName: string;
  username: string;
  roleName: string;
  isActive: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: UserAuthInfo;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

const authService = {
  login: (data: LoginRequest) =>
    http.post<ApiResponse<TokenResponse>>("/auth/login", data),
  register: (data: RegisterRequest) =>
    http.post<ApiResponse<null>>("/auth/register", data),
  forgotPassword: (email: string) =>
    http.post<ApiResponse<null>>("/auth/forgot-password", { email }),
  resetPassword: (data: ResetPasswordRequest) =>
    http.post<ApiResponse<null>>("/auth/reset-password", data),
  refreshToken: (data: RefreshTokenRequest) =>
    http.post<ApiResponse<TokenResponse>>("/auth/refresh-token", data),
  getProfile: () =>
    http.get<ApiResponse<UserProfileResponse>>("/auth/profile"),
};

export default authService;
