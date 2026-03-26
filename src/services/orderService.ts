import http from "./http";
import type { ApiResponse } from "./apiTypes";

export enum OrderStatusApi {
  Pending = 0,
  Confirmed = 1,
  Processing = 2,
  Shipping = 3,
  Delivered = 4,
  Cancelled = 5,
  Returned = 6,
}

export interface OrderDetailResponse {
  id: string;
  productId: string | null;
  giftBoxId: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderHistoryResponse {
  id: string;
  orderId: string;
  status: OrderStatusApi;
  note: string;
  changedBy: string;
  createdAt: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  voucherId?: string | null;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  currentStatus: OrderStatusApi;
  paymentMethod: string;
  shippingAddress: string;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  note?: string | null;
  orderDetails: OrderDetailResponse[];
  orderHistories: OrderHistoryResponse[];
}

const orderService = {
  getAll: () => http.get<ApiResponse<OrderResponse[]>>("/orders"),
  getById: (id: string) => http.get<ApiResponse<OrderResponse>>(`/orders/${id}`),
  getByUserId: (userId: string) =>
    http.get<ApiResponse<OrderResponse[]>>(`/orders/user/${userId}`),
  updateStatus: (id: string, status: OrderStatusApi) =>
    http.patch<ApiResponse<OrderResponse>>(`/orders/${id}/status`, status, {
      headers: { "Content-Type": "application/json" },
    }),
};

export default orderService;
