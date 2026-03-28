import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { boxTypes, paymentMethods } from "../constants/content";
import {
  botResponses,
  categories as mockCategories,
  giftBoxes as mockGiftBoxes,
  initialChat,
  mockAddresses,
  notifications,
  products as mockProducts,
  vouchers as mockVouchers,
} from "../mocks/data";
import { session } from "./session";
import {
  Address,
  AuthTokens,
  CartItem,
  ChatMessage,
  GiftBox,
  Order,
  OrderStatus,
  PaymentMethodId,
  Product,
  UserProfile,
  Voucher,
} from "../types/domain";

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const globalProcess = globalThis as {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const baseUrlFromEnv = globalProcess.process?.env?.EXPO_PUBLIC_API_BASE_URL;

const API_BASE_URL = (baseUrlFromEnv || "https://prn232.onrender.com").replace(/\/+$/, "");

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
});

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

interface AuthTokenModel {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    roleName: string;
    isActive: boolean;
  };
}

interface BackendImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder?: number;
}

interface BackendInventory {
  id: string;
  quantity: number;
}

interface BackendProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string | null;
  createdAt: string;
  images?: BackendImage[] | null;
  inventories?: BackendInventory[] | null;
}

interface BackendGiftBoxComponent {
  id: string;
  productId: string;
  productName?: string | null;
  quantity: number;
}

interface BackendGiftBox {
  id: string;
  code: string;
  name: string;
  description: string;
  basePrice: number;
  isCustom: boolean;
  createdAt: string;
  categoryId: string;
  categoryName?: string | null;
  images?: BackendImage[] | null;
  boxComponents?: BackendGiftBoxComponent[] | null;
}

interface BackendCategory {
  id: string;
  name: string;
}

interface BackendVoucher {
  id: string;
  code: string;
  description: string;
  isPercentage: boolean;
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number | null;
  endDate: string;
  isActive: boolean;
}

interface BackendProfile {
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

interface BackendCartItem {
  id: string;
  productId?: string | null;
  productName?: string | null;
  productImageUrl?: string | null;
  giftBoxId?: string | null;
  giftBoxName?: string | null;
  giftBoxImageUrl?: string | null;
  displayName: string;
  displayImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
}

interface BackendCart {
  id: string;
  items: BackendCartItem[];
}

interface BackendOrderDetail {
  id: string;
  productId?: string | null;
  giftBoxId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BackendOrderHistory {
  id: string;
  status: string | number;
  note: string;
  changedBy: string;
  createdAt: string;
}

interface BackendOrder {
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  currentStatus: string | number;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  note?: string | null;
  orderDetails: BackendOrderDetail[];
  orderHistories: BackendOrderHistory[];
}

interface BackendMomoPaymentResponse {
  orderId: string;
  payUrl?: string | null;
  deeplink?: string | null;
  qrCodeUrl?: string | null;
  message: string;
  localPaymentStatus: string;
}

interface BackendMomoPaymentStatusResponse {
  orderId: string;
  momoOrderId: string;
  requestId: string;
  amount: number;
  transId?: number | null;
  resultCode: number;
  message: string;
  localPaymentStatus: string;
}

type CreateOrderPayload = {
  userId: string;
  note?: string;
  paymentMethod: string;
  voucherId?: string;
  shippingPhone: string;
  shippingAddress: string;
  orderDetails: Array<{
    productId?: string;
    giftBoxId?: string;
    quantity: number;
    price: number;
  }>;
};

type CheckoutCartPayload = {
  shippingAddress: string;
  shippingPhone: string;
  voucherCode?: string;
  note?: string;
  selectedItemIds?: string[];
};

type CreateMomoPaymentPayload = {
  orderId?: string;
  orderInfo?: string;
};

type MomoIpnPayload = {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  amount?: number;
  orderInfo?: string;
  orderType?: string;
  transId?: number;
  resultCode?: number;
  message?: string;
  payType?: string;
  responseTime?: number;
  extraData?: string;
  signature?: string;
};

const categoryIcons = ["🎁", "🍫", "🍷", "🍵", "✨", "🧺"];
const categoryColors = ["#8B1A2B", "#C9A84C", "#4A5D52", "#8B6914", "#A0522D", "#6D4C41"];

const productCache = new Map<string, Product>();
const giftBoxCache = new Map<string, GiftBox>();

function isGuid(value: string | undefined | null): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data as
      | {
          message?: string;
          title?: string;
          detail?: string;
          errors?: string[] | Record<string, string[]>;
        }
      | undefined;

    const apiMessage =
      responseData?.message || responseData?.title || responseData?.detail;
    if (apiMessage) return apiMessage;

    if (Array.isArray(responseData?.errors) && responseData.errors.length) {
      return responseData.errors[0];
    }

    if (responseData?.errors && typeof responseData.errors === "object") {
      const firstFieldErrors = Object.values(responseData.errors)[0];
      if (Array.isArray(firstFieldErrors) && firstFieldErrors.length) {
        return firstFieldErrors[0];
      }
    }

    if (error.code === "ECONNABORTED") {
      return "K\u1ebft n\u1ed1i qu\u00e1 th\u1eddi gian. Vui l\u00f2ng th\u1eed l\u1ea1i.";
    }

    if (!error.response) {
      return "Kh\u00f4ng th\u1ec3 k\u1ebft n\u1ed1i m\u00e1y ch\u1ee7. Vui l\u00f2ng th\u1eed l\u1ea1i.";
    }

    if (statusCode === 401 || statusCode === 403) {
      return fallback;
    }

    if (statusCode && statusCode >= 500) {
      return fallback;
    }

    if (error.message && /^Request failed with status code \\d{3}$/i.test(error.message)) {
      return fallback;
    }

    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function mapProfileToUser(profile: BackendProfile): UserProfile {
  return {
    id: profile.id,
    username: profile.username,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    roleName: profile.roleName,
    isActive: profile.isActive,
    joinDate: new Intl.DateTimeFormat("vi-VN", {
      month: "long",
      year: "numeric",
    }).format(new Date(profile.createdAt)),
  };
}

function mapCategory(category: BackendCategory, index: number) {
  return {
    id: category.id,
    name: category.name,
    icon: categoryIcons[index % categoryIcons.length],
    color: categoryColors[index % categoryColors.length],
  };
}

function mapProduct(product: BackendProduct): Product {
  const image = product.images?.[0]?.url || mockProducts[0]?.image || "";
  const rating = 4.6 + ((product.name.length % 4) * 0.1);
  const reviewCount = 20 + ((product.name.length * 17) % 210);

  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    originalPrice: undefined,
    image,
    category: product.categoryName || "Sản phẩm",
    categoryId: product.categoryId,
    rating: Number(rating.toFixed(1)),
    reviewCount,
    description: product.description || "Sản phẩm cao cấp từ HappyBox.",
    details: [
      `SKU: ${product.sku || "N/A"}`,
      `Danh mục: ${product.categoryName || "N/A"}`,
      ...(product.inventories?.[0]
        ? [`Tồn kho: ${product.inventories[0].quantity}`]
        : []),
    ],
    isNew:
      Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 45,
    isBestSeller: Boolean(product.inventories?.[0] && product.inventories[0].quantity < 10),
  };
}

function mapGiftBox(giftBox: BackendGiftBox): GiftBox {
  const image = giftBox.images?.[0]?.url || mockGiftBoxes[0]?.image || "";
  const items =
    giftBox.boxComponents?.map((component) => {
      const name = component.productName?.trim() || component.productId.slice(0, 8);
      return `${name} x${component.quantity}`;
    }) || [];

  return {
    id: giftBox.id,
    name: giftBox.name,
    price: Number(giftBox.basePrice),
    image,
    description: giftBox.description || "Hộp quà cao cấp.",
    items,
    tag: giftBox.isCustom ? "Custom" : "Premium",
  };
}

function mapVoucher(voucher: BackendVoucher): Voucher {
  const now = Date.now();
  const expiryTime = new Date(voucher.endDate).getTime();

  return {
    id: voucher.id,
    code: voucher.code,
    title: voucher.code,
    description: voucher.description,
    discountType: voucher.isPercentage ? "percent" : "fixed",
    discountValue: Number(voucher.value),
    minOrder: Number(voucher.minOrderValue),
    maxDiscount: voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : undefined,
    expiry: voucher.endDate,
    isValid: voucher.isActive && expiryTime >= now,
  };
}

function normalizeOrderStatus(status: string | number): OrderStatus {
  if (typeof status === "number") {
    if (status === 0) return "pending";
    if (status === 1 || status === 2) return "confirmed";
    if (status === 3) return "shipping";
    if (status === 4) return "delivered";
    if (status === 5 || status === 6) return "cancelled";
    return "pending";
  }

  const normalized = status.trim().toLowerCase();
  if (/^\d+$/.test(normalized)) {
    return normalizeOrderStatus(Number(normalized));
  }
  if (normalized === "pending") return "pending";
  if (normalized === "confirmed") return "confirmed";
  if (normalized === "processing") return "confirmed";
  if (normalized === "shipping") return "shipping";
  if (normalized === "delivered") return "delivered";
  if (normalized === "cancelled") return "cancelled";
  if (normalized === "returned") return "cancelled";
  return "pending";
}

function normalizePaymentMethod(method: string): PaymentMethodId {
  const normalized = method.trim().toLowerCase();
  if (normalized.includes("momo")) return "momo";
  if (normalized.includes("vn")) return "vnpay";
  if (normalized.includes("bank")) return "bank";
  return "cod";
}

function buildTimeline(order: BackendOrder): Order["timeline"] {
  const histories = [...(order.orderHistories || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const statusOrder: Array<{ key: OrderStatus; label: string }> = [
    { key: "pending", label: "Đặt hàng thành công" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "shipping", label: "Đang vận chuyển" },
    { key: "delivered", label: "Giao hàng thành công" },
  ];

  if (normalizeOrderStatus(order.currentStatus) === "cancelled") {
    statusOrder[statusOrder.length - 1] = {
      key: "cancelled",
      label: "Đơn hàng đã hủy",
    };
  }

  const doneSet = new Set(histories.map((item) => normalizeOrderStatus(item.status)));

  return statusOrder.map((step) => {
    const matched = histories.find(
      (history) => normalizeOrderStatus(history.status) === step.key,
    );
    return {
      status: step.label,
      time: matched
        ? new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(matched.createdAt))
        : "--",
      done: doneSet.has(step.key),
    };
  });
}

function mapOrderDetailName(detail: BackendOrderDetail): {
  name: string;
  image: string;
  productId: string;
} {
  if (detail.productId && productCache.has(detail.productId)) {
    const product = productCache.get(detail.productId)!;
    return {
      name: product.name,
      image: product.image,
      productId: detail.productId,
    };
  }

  if (detail.giftBoxId && giftBoxCache.has(detail.giftBoxId)) {
    const giftBox = giftBoxCache.get(detail.giftBoxId)!;
    return {
      name: giftBox.name,
      image: giftBox.image,
      productId: detail.giftBoxId,
    };
  }

  if (detail.productId) {
    return {
      name: `Sản phẩm #${detail.productId.slice(0, 8)}`,
      image: mockProducts[0]?.image || "",
      productId: detail.productId,
    };
  }

  const fallbackGiftBoxId = detail.giftBoxId || detail.id;
  return {
    name: `Hộp quà #${fallbackGiftBoxId.slice(0, 8)}`,
    image: mockGiftBoxes[0]?.image || "",
    productId: fallbackGiftBoxId,
  };
}

function mapShippingAddress(shippingAddress: string, phone: string): Address {
  const parts = shippingAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    id: `address-${shippingAddress}`,
    label: "Giao hàng",
    fullName: "Người nhận",
    phone,
    address: parts[0] || shippingAddress,
    ward: parts[1] || "",
    district: parts[2] || "",
    city: parts.slice(3).join(", "),
    isDefault: true,
  };
}

function mapOrder(order: BackendOrder): Order {
  const status = normalizeOrderStatus(order.currentStatus);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status,
    items: order.orderDetails.map((detail) => {
      const basic = mapOrderDetailName(detail);
      return {
        productId: basic.productId,
        name: basic.name,
        image: basic.image,
        price: Number(detail.unitPrice),
        quantity: detail.quantity,
      };
    }),
    subtotal: Number(order.totalAmount),
    discount: Number(order.discountAmount),
    shipping: Number(order.shippingFee),
    total: Number(order.finalAmount),
    address: mapShippingAddress(order.shippingAddress, "Chua cap nhat"),
    paymentMethod: normalizePaymentMethod(order.paymentMethod),
    note: order.note || "",
    createdAt: order.createdAt,
    timeline: buildTimeline(order),
  };
}

function mapCartItem(item: BackendCartItem): CartItem {
  const isProduct = Boolean(item.productId);
  return {
    id: item.id,
    productId: (item.productId || item.giftBoxId || item.id) as string,
    backendProductId: item.productId || undefined,
    backendGiftBoxId: item.giftBoxId || undefined,
    name: item.displayName || item.productName || item.giftBoxName || "Sản phẩm",
    image:
      item.displayImageUrl ||
      item.productImageUrl ||
      item.giftBoxImageUrl ||
      mockProducts[0]?.image ||
      "",
    price: Number(item.unitPrice),
    quantity: item.quantity,
    type: isProduct ? "product" : "giftbox",
  };
}

function normalizeApiData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "success" in payload) {
    const apiResponse = payload as ApiResponse<T> & { data?: T };
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || "Yêu cầu thất bại");
    }

    if ("data" in apiResponse) {
      return apiResponse.data as T;
    }

    return payload as T;
  }

  return payload as T;
}

async function refreshAccessToken(): Promise<AuthTokens | null> {
  const tokens = session.getTokens();
  if (!tokens?.refreshToken || !tokens.accessToken) {
    return null;
  }

  try {
    const response = await http.post<ApiResponse<AuthTokenModel>>("/api/Auth/refresh-token", {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    const tokenModel = normalizeApiData<AuthTokenModel>(response.data);
    const refreshed: AuthTokens = {
      accessToken: tokenModel.accessToken,
      refreshToken: tokenModel.refreshToken,
    };
    session.setTokens(refreshed);
    return refreshed;
  } catch {
    session.setTokens(null);
    return null;
  }
}

async function request<T>(
  config: AxiosRequestConfig,
  options?: { auth?: boolean; retry?: boolean },
): Promise<T> {
  const auth = options?.auth ?? false;
  const retry = options?.retry ?? true;

  const finalConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...(config.headers || {}),
    },
  };

  if (auth) {
    const accessToken = session.getTokens()?.accessToken;
    if (!accessToken) {
      throw new Error("Bạn chưa đăng nhập.");
    }
    finalConfig.headers = {
      ...finalConfig.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  try {
    const response = await http.request(finalConfig);
    return normalizeApiData<T>(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (auth && retry && axiosError.response?.status === 401) {
      const refreshedTokens = await refreshAccessToken();
      if (refreshedTokens?.accessToken) {
        const retriedConfig: AxiosRequestConfig = {
          ...finalConfig,
          headers: {
            ...finalConfig.headers,
            Authorization: `Bearer ${refreshedTokens.accessToken}`,
          },
        };
        const retried = await http.request(retriedConfig);
        return normalizeApiData<T>(retried.data);
      }
    }
    throw error;
  }
}

function mapPaymentMethodToApi(method: PaymentMethodId): string {
  if (method === "momo") return "MOMO";
  if (method === "vnpay") return "VN_PAY";
  if (method === "bank") return "BANK";
  return "COD";
}

export const api = {
  config: {
    baseUrl: API_BASE_URL,
  },
  auth: {
    signIn: async (
      email: string,
      password: string,
    ): Promise<{ user: UserProfile; tokens: AuthTokens }> => {
      const tokenModel = await request<AuthTokenModel>({
        url: "/api/Auth/login",
        method: "POST",
        data: { email, password },
      });

      const tokens: AuthTokens = {
        accessToken: tokenModel.accessToken,
        refreshToken: tokenModel.refreshToken,
      };

      session.setTokens(tokens);

      if (tokenModel.user) {
        const user: UserProfile = {
          id: tokenModel.user.id,
          username: tokenModel.user.username,
          fullName: tokenModel.user.fullName,
          email: tokenModel.user.email,
          phone: tokenModel.user.phone,
          address: tokenModel.user.address,
          roleName: tokenModel.user.roleName,
          isActive: tokenModel.user.isActive,
          joinDate: "Vừa tham gia",
        };
        return { user, tokens };
      }

      const profile = await request<BackendProfile>(
        {
          url: "/api/Auth/profile",
          method: "GET",
        },
        { auth: true },
      );

      return { user: mapProfileToUser(profile), tokens };
    },
    signUp: async (payload: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
    }): Promise<{ user: UserProfile; tokens: AuthTokens }> => {
      const normalizedUsername = payload.email.split("@")[0].slice(0, 50);

      await request<void>({
        url: "/api/Auth/register",
        method: "POST",
        data: {
          username: normalizedUsername,
          fullName: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          address: "",
          password: payload.password,
        },
      });

      return api.auth.signIn(payload.email, payload.password);
    },
    forgotPassword: async (email: string) => {
      await request<void>({
        url: "/api/Auth/forgot-password",
        method: "POST",
        data: { email },
      });
      return { success: true };
    },
    resetPassword: async (payload: {
      email: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      await request<void>({
        url: "/api/Auth/reset-password",
        method: "POST",
        data: payload,
      });
      return { success: true };
    },
    changePassword: async (payload: {
      password: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      return request<{ message: string }>(
        {
          url: "/api/ChangePassword",
          method: "POST",
          data: payload,
        },
        { auth: true },
      );
    },
    profile: async (): Promise<UserProfile> => {
      const profile = await request<BackendProfile>(
        {
          url: "/api/Auth/profile",
          method: "GET",
        },
        { auth: true },
      );
      return mapProfileToUser(profile);
    },
    logoutSession: async () => {
      session.setTokens(null);
    },
  },
  products: {
    list: async (): Promise<Product[]> => {
      try {
        const backendProducts = await request<BackendProduct[]>({
          url: "/api/Product",
          method: "GET",
        });

        const mapped = backendProducts.map(mapProduct);
        mapped.forEach((item) => productCache.set(item.id, item));

        return mapped.length > 0 ? mapped : mockProducts;
      } catch {
        return mockProducts;
      }
    },
    detail: async (productId: string) => {
      if (!isGuid(productId)) {
        return mockProducts.find((item) => item.id === productId) ?? null;
      }

      try {
        const backendProduct = await request<BackendProduct>({
          url: `/api/Product/${productId}`,
          method: "GET",
        });
        const mapped = mapProduct(backendProduct);
        productCache.set(mapped.id, mapped);
        return mapped;
      } catch {
        return mockProducts.find((item) => item.id === productId) ?? null;
      }
    },
    categories: async () => {
      try {
        const backendCategories = await request<BackendCategory[]>({
          url: "/api/Category/GetAllCategories",
          method: "GET",
        });
        const mapped = backendCategories.map(mapCategory);
        return mapped.length > 0 ? mapped : mockCategories;
      } catch {
        return mockCategories;
      }
    },
  },
  giftBoxes: {
    list: async () => {
      try {
        let backendGiftBoxes: BackendGiftBox[] = [];
        try {
          backendGiftBoxes = await request<BackendGiftBox[]>({
            url: "/api/GiftBox/active",
            method: "GET",
          });
        } catch {
          backendGiftBoxes = await request<BackendGiftBox[]>({
            url: "/api/GiftBox",
            method: "GET",
          });
        }

        const mapped = backendGiftBoxes.map(mapGiftBox);
        mapped.forEach((item) => giftBoxCache.set(item.id, item));

        return mapped.length > 0 ? mapped : mockGiftBoxes;
      } catch {
        return mockGiftBoxes;
      }
    },
    detail: async (giftBoxId: string) => {
      if (!isGuid(giftBoxId)) {
        return mockGiftBoxes.find((item) => item.id === giftBoxId) ?? null;
      }

      try {
        const backendGiftBox = await request<BackendGiftBox>({
          url: `/api/GiftBox/${giftBoxId}`,
          method: "GET",
        });
        const mapped = mapGiftBox(backendGiftBox);
        giftBoxCache.set(mapped.id, mapped);
        return mapped;
      } catch {
        return mockGiftBoxes.find((item) => item.id === giftBoxId) ?? null;
      }
    },
    boxTypes: async () => {
      await wait(120);
      return boxTypes;
    },
  },
  vouchers: {
    list: async (): Promise<Voucher[]> => {
      try {
        const backendVouchers = await request<BackendVoucher[]>({
          url: "/api/vouchers",
          method: "GET",
        });
        const mapped = backendVouchers.map(mapVoucher);
        return mapped.length > 0 ? mapped : mockVouchers;
      } catch {
        return mockVouchers;
      }
    },
  },
  cart: {
    get: async (): Promise<CartItem[]> => {
      const cart = await request<BackendCart>(
        {
          url: "/api/Cart",
          method: "GET",
        },
        { auth: true },
      );
      return (cart.items || []).map(mapCartItem);
    },
    count: async (): Promise<number> => {
      return request<number>(
        {
          url: "/api/Cart/count",
          method: "GET",
        },
        { auth: true },
      );
    },
    addItem: async (payload: { productId?: string; giftBoxId?: string; quantity: number }) => {
      const cart = await request<BackendCart>(
        {
          url: "/api/Cart/items",
          method: "POST",
          data: payload,
        },
        { auth: true },
      );
      return cart.items.map(mapCartItem);
    },
    updateItem: async (cartItemId: string, quantity: number) => {
      const cart = await request<BackendCart>(
        {
          url: `/api/Cart/items/${cartItemId}`,
          method: "PUT",
          data: { quantity },
        },
        { auth: true },
      );
      return cart.items.map(mapCartItem);
    },
    removeItem: async (cartItemId: string) => {
      await request<void>(
        {
          url: `/api/Cart/items/${cartItemId}`,
          method: "DELETE",
        },
        { auth: true },
      );
    },
    removeItems: async (cartItemIds: string[]) => {
      await request(
        {
          url: "/api/Cart/items",
          method: "DELETE",
          data: cartItemIds,
        },
        { auth: true },
      );
    },
    clear: async () => {
      await request<void>(
        {
          url: "/api/Cart",
          method: "DELETE",
        },
        { auth: true },
      );
    },
    checkout: async (payload: CheckoutCartPayload): Promise<Order> => {
      const order = await request<BackendOrder>(
        {
          url: "/api/Cart/checkout",
          method: "POST",
          data: payload,
        },
        { auth: true },
      );
      return mapOrder(order);
    },
  },
  orders: {
    listAll: async (): Promise<Order[]> => {
      try {
        const orders = await request<BackendOrder[]>(
          {
            url: "/api/orders",
            method: "GET",
          },
          { auth: true },
        );
        return orders
          .map(mapOrder)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch {
        return [];
      }
    },
    listByUser: async (userId: string): Promise<Order[]> => {
      try {
        const orders = await request<BackendOrder[]>(
          {
            url: `/api/orders/user/${userId}`,
            method: "GET",
          },
          { auth: true },
        );
        return orders
          .map(mapOrder)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch {
        return [];
      }
    },
    detail: async (orderId: string): Promise<Order | null> => {
      try {
        const order = await request<BackendOrder>(
          {
            url: `/api/orders/${orderId}`,
            method: "GET",
          },
          { auth: true },
        );
        return mapOrder(order);
      } catch {
        return null;
      }
    },
    create: async (payload: CreateOrderPayload): Promise<Order> => {
      const order = await request<BackendOrder>(
        {
          url: "/api/orders",
          method: "POST",
          data: payload,
        },
        { auth: true },
      );
      return mapOrder(order);
    },
    updateStatus: async (orderId: string, status: number) => {
      const order = await request<BackendOrder>(
        {
          url: `/api/orders/${orderId}/status`,
          method: "PATCH",
          data: status,
        },
        { auth: true },
      );
      return mapOrder(order);
    },
    delete: async (orderId: string) => {
      await request(
        {
          url: `/api/orders/${orderId}`,
          method: "DELETE",
        },
        { auth: true },
      );
    },
    cancel: async (orderId: string) => {
      await api.orders.updateStatus(orderId, 5);
    },
  },
  payment: {
    createOrderAndMomoPayment: async (payload: CreateOrderPayload) => {
      return request<BackendMomoPaymentResponse>(
        {
          url: "/api/Payment/momo/create-order",
          method: "POST",
          data: payload,
        },
        { auth: true },
      );
    },
    createMomoPayment: async (payload: CreateMomoPaymentPayload) => {
      return request<BackendMomoPaymentResponse>(
        {
          url: "/api/Payment/momo/create",
          method: "POST",
          data: payload,
        },
        { auth: true },
      );
    },
    getMomoOrderStatus: async (orderId: string) => {
      return request<BackendMomoPaymentStatusResponse>(
        {
          url: `/api/Payment/momo/orders/${orderId}/status`,
          method: "GET",
        },
        { auth: true },
      );
    },
    momoIpn: async (payload: MomoIpnPayload) => {
      await request({
        url: "/api/Payment/momo/ipn",
        method: "POST",
        data: payload,
      });
    },
  },
  profile: {
    get: async (): Promise<UserProfile> => {
      return api.auth.profile();
    },
  },
  checkout: {
    createOrderPayload: (params: {
      userId: string;
      paymentMethod: PaymentMethodId;
      voucherId?: string;
      shippingAddress: string;
      shippingPhone: string;
      note?: string;
      cartItems: CartItem[];
    }): CreateOrderPayload => {
      const details: CreateOrderPayload["orderDetails"] = [];

      params.cartItems.forEach((item) => {
        if (item.type === "custom") return;

        if (item.backendProductId || (item.type === "product" && isGuid(item.productId))) {
          details.push({
            productId: item.backendProductId || item.productId,
            quantity: item.quantity,
            price: item.price,
          });
          return;
        }

        if (item.backendGiftBoxId || (item.type === "giftbox" && isGuid(item.productId))) {
          details.push({
            giftBoxId: item.backendGiftBoxId || item.productId,
            quantity: item.quantity,
            price: item.price,
          });
        }
      });

      return {
        userId: params.userId,
        paymentMethod: mapPaymentMethodToApi(params.paymentMethod),
        voucherId: params.voucherId,
        shippingAddress: params.shippingAddress,
        shippingPhone: params.shippingPhone,
        note: params.note,
        orderDetails: details,
      };
    },
  },
  support: {
    paymentMethods: async () => {
      await wait(120);
      return paymentMethods;
    },
    notifications: async () => {
      await wait(200);
      return notifications;
    },
    addressBook: async (): Promise<Address[]> => {
      await wait(150);
      return mockAddresses;
    },
    initialChat: async (): Promise<ChatMessage[]> => {
      await wait(120);
      return initialChat;
    },
    askBot: async (text: string): Promise<string> => {
      await wait(700);
      const lower = text.toLowerCase();
      if (lower.includes("gift") || lower.includes("qua") || lower.includes("hop")) {
        return botResponses.gift;
      }
      if (lower.includes("order") || lower.includes("don")) {
        return botResponses.order;
      }
      if (lower.includes("ship") || lower.includes("giao")) {
        return botResponses.shipping;
      }
      if (lower.includes("voucher") || lower.includes("giam")) {
        return botResponses.voucher;
      }
      return botResponses.default;
    },
  },
  errors: {
    getMessage: getErrorMessage,
  },
};
