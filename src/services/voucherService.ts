import http from "./http";
import type { ApiResponse, LegacyApiResponse } from "./apiTypes";

export interface VoucherResponse {
  id: string;
  code: string;
  description: string;
  isPercentage: boolean;
  value: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive: boolean;
  createdAt: string;
}

async function unwrapVoucherList() {
  const response = await http.get<
    ApiResponse<VoucherResponse[]> | LegacyApiResponse<VoucherResponse[]>
  >("/vouchers");

  return response.data.data;
}

const voucherService = {
  getAll: unwrapVoucherList,
};

export default voucherService;
