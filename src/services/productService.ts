import http from "./http";
import type { ApiResponse } from "./apiTypes";
import type { ImageResponse } from "./imageService";

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  categoryId: string;
  categoryName?: string;
  createdAt: string;
  updatedAt?: string;
  images?: ImageResponse[];
}

const productService = {
  getAll: () => http.get<ApiResponse<ProductResponse[]>>("/Product"),
  getById: (id: string) =>
    http.get<ApiResponse<ProductResponse>>(`/Product/${id}`),
};

export default productService;
