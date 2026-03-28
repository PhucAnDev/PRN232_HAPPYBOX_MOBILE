import { CartSummary, OrderStatus, Voucher } from "../types/domain";

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);

export const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));

export const getStatusLabel = (status: OrderStatus) => {
  const labels: Record<OrderStatus, string> = {
    pending: "Chờ Xác Nhận",
    confirmed: "Đã Xác Nhận",
    shipping: "Đang Giao",
    delivered: "Đã Giao",
    cancelled: "Đã Hủy",
  };

  return labels[status];
};

export const getStatusTone = (status: OrderStatus) => {
  const tones: Record<OrderStatus, string> = {
    pending: "#E65100",
    confirmed: "#C9A84C",
    shipping: "#4A5D52",
    delivered: "#2D6A4F",
    cancelled: "#C62828",
  };

  return tones[status];
};

export const calculateCartSummary = (
  subtotal: number,
  voucher: Voucher | null,
): CartSummary => {
  const shipping = subtotal >= 500000 ? 0 : 30000;
  let discount = 0;

  if (voucher && voucher.isValid && subtotal >= voucher.minOrder) {
    if (voucher.discountType === "percent") {
      discount = subtotal * (voucher.discountValue / 100);
      if (voucher.maxDiscount) {
        discount = Math.min(discount, voucher.maxDiscount);
      }
    } else {
      discount = voucher.discountValue;
    }
  }

  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
  };
};
