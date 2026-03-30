export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

export type PaymentMethodId = "cod" | "bank" | "momo" | "vnpay";
export type VoucherDiscountType = "percent" | "fixed";
export type CartItemType = "product" | "giftbox" | "custom";
export type ChatRole = "user" | "bot";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categoryId: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  description: string;
  details: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface GiftBox {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  items: string[];
  tag: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  expiry: string;
  isValid: boolean;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface OrderTimelineItem {
  status: string;
  time: string;
  done: boolean;
}

export interface Order {
  id: string;
  orderNumber?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: Address;
  paymentMethod: PaymentMethodId;
  note?: string;
  createdAt: string;
  timeline: OrderTimelineItem[];
}

export interface UserProfile {
  id: string;
  username?: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  roleName?: string;
  isActive?: boolean;
  avatar?: string;
  joinDate: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  time: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  kind: "promo" | "order" | "voucher" | "info";
  orderId?: string;
  orderNumber?: string;
  orderStatus?: OrderStatus;
  createdAt: string;
  isRead: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  backendProductId?: string;
  backendGiftBoxId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  type: CartItemType;
}

export interface CustomGiftBoxDraft {
  boxTypeId: string;
  boxTypeName: string;
  boxPrice: number;
  capacity: number;
  items: Array<{ product: Product; quantity: number }>;
  totalPrice: number;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export interface CheckoutDraft {
  paymentMethod: PaymentMethodId;
  note: string;
  shippingRecipientName: string;
  shippingPhone: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingWard: string;
  shippingAddressDetail: string;
  shippingAddress: string;
  addressId?: string;
}

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  subtitle: string;
  icon: string;
}

export interface BoxTypeOption {
  id: string;
  name: string;
  capacity: number;
  price: number;
  emoji: string;
  description: string;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
}
