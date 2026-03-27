import http from "./http";
import type { ApiResponse } from "./apiTypes";

export interface UserResponse {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  roleId: string;
  roleName?: string;
  taxCode?: string;
  companyName?: string;
  createdAt: string;
  updatedAt?: string;
}

const userService = {
  getAll: () => http.get<ApiResponse<UserResponse[]>>("/User"),
  getById: (id: string) => http.get<ApiResponse<UserResponse>>(`/User/${id}`),
};

export default userService;
