import http from "./http";
import type { ApiResponse } from "./apiTypes";
import type { OrderResponse } from "./orderService";

export interface CartItemResponse {
  id: string;
  cartId: string;
  productId: string | null;
  productName: string | null;
  productSKU: string | null;
  productImageUrl: string | null;
  giftBoxId: string | null;
  giftBoxName: string | null;
  giftBoxCode: string | null;
  giftBoxImageUrl: string | null;
  itemType: string | null;
  displayName: string | null;
  displayImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CartResponse {
  id: string;
  userId: string;
  userName: string | null;
  items: CartItemResponse[];
  totalItems: number;
  uniqueItemsCount: number;
  subTotal: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface AddToCartRequest {
  productId?: string | null;
  giftBoxId?: string | null;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CheckoutRequest {
  shippingAddress: string;
  shippingPhone: string;
  paymentMethod?: string | null;
  voucherCode?: string | null;
  note?: string | null;
  selectedItemIds?: string[] | null;
}

const cartService = {
  getCart: async (): Promise<CartResponse> => {
    const response = await http.get<ApiResponse<CartResponse>>("/Cart");
    return response.data.data;
  },
  getCartCount: async (): Promise<number> => {
    const response = await http.get<ApiResponse<number>>("/Cart/count");
    return response.data.data;
  },
  addItemToCart: async (payload: AddToCartRequest): Promise<CartResponse> => {
    const response = await http.post<ApiResponse<CartResponse>>("/Cart/items", payload);
    return response.data.data;
  },
  updateCartItem: async (
    cartItemId: string,
    payload: UpdateCartItemRequest,
  ): Promise<CartResponse> => {
    const response = await http.put<ApiResponse<CartResponse>>(
      `/Cart/items/${cartItemId}`,
      payload,
    );
    return response.data.data;
  },
  removeCartItem: async (cartItemId: string) => {
    await http.delete(`/Cart/items/${cartItemId}`);
  },
  clearCart: async () => {
    await http.delete("/Cart");
  },
  checkout: async (payload: CheckoutRequest): Promise<OrderResponse> => {
    const response = await http.post<ApiResponse<OrderResponse>>("/Cart/checkout", payload);
    return response.data.data;
  },
};

export default cartService;
