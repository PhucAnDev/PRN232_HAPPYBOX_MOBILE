import http from "./http";
import type { ApiResponse } from "./apiTypes";
import type { ImageResponse } from "./imageService";

export interface BoxComponentResponse {
  id: string;
  giftBoxId: string;
  productId: string;
  productName?: string;
  productSKU?: string;
  productPrice: number;
  quantity: number;
}

export interface GiftBoxResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  isCustom: boolean;
  userId?: string;
  categoryId: string;
  categoryName?: string;
  giftBoxComponentConfigId?: string;
  componentConfigName?: string;
  createdAt: string;
  updatedAt?: string;
  images?: ImageResponse[];
  boxComponents?: BoxComponentResponse[];
}

const giftBoxService = {
  getAll: () => http.get<ApiResponse<GiftBoxResponse[]>>("/GiftBox"),
  getActive: () => http.get<ApiResponse<GiftBoxResponse[]>>("/GiftBox/active"),
  getById: (id: string) =>
    http.get<ApiResponse<GiftBoxResponse>>(`/GiftBox/${id}`),
};

export default giftBoxService;
