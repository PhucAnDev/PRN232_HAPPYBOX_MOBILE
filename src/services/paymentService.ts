import http from "./http";
import type { ApiResponse } from "./apiTypes";

export interface CreateMomoOrderRequest {
  userId?: string;
  note?: string | null;
  paymentMethod: string;
  voucherId?: string | null;
  shippingPhone: string;
  shippingAddress: string;
  orderDetails: Array<{
    productId?: string | null;
    giftBoxId?: string | null;
    quantity: number;
    price: number;
  }>;
}

export interface CreateMomoOrderResponse {
  orderId: string;
  payUrl: string | null;
  deeplink?: string | null;
  qrCodeUrl?: string | null;
}

export interface PaymentStatusData {
  orderId: string;
  resultCode: number;
  amount: number;
  localPaymentStatus: string;
  message: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const paymentService = {
  createMomoOrder: (data: CreateMomoOrderRequest) =>
    http.post<ApiResponse<CreateMomoOrderResponse>>(
      "/Payment/momo/create-order",
      data,
    ),
  getMomoOrderStatus: (orderId: string) =>
    http.get<ApiResponse<PaymentStatusData>>(`/Payment/momo/orders/${orderId}/status`),
  async confirmMomoPayment(orderId: string, maxAttempts = 5, delayMs = 1500) {
    let latestStatus: PaymentStatusData | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const response = await paymentService.getMomoOrderStatus(orderId);
      latestStatus = response.data.data;

      if (
        latestStatus.resultCode === 0 ||
        latestStatus.localPaymentStatus === "Success" ||
        latestStatus.localPaymentStatus === "Failed"
      ) {
        return latestStatus;
      }

      if (attempt < maxAttempts - 1) {
        await delay(delayMs);
      }
    }

    if (!latestStatus) {
      throw new Error("Khong nhan duoc trang thai thanh toan MoMo.");
    }

    return latestStatus;
  },
};

export default paymentService;
