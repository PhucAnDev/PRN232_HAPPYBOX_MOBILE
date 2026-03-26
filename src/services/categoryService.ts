import http from "./http";
import type { ApiResponse } from "./apiTypes";

export interface CategoryResponse {
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
  createdAt: string;
  updatedAt?: string;
}

const categoryService = {
  getAll: () =>
    http.get<ApiResponse<CategoryResponse[]>>("/Category/GetAllCategories"),
  getById: (id: string) =>
    http.get<ApiResponse<CategoryResponse>>(`/Category/GetCategoryById/${id}`),
};

export default categoryService;
