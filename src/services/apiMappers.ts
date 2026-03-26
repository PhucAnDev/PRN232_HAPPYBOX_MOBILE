import { IMAGES, categories as mockCategories, giftBoxes as mockGiftBoxes, products as mockProducts } from "../mocks/data";
import type {
  Address,
  CartItem,
  Category,
  GiftBox,
  Order,
  OrderStatus,
  PaymentMethodId,
  Product,
  UserProfile,
  Voucher,
} from "../types/domain";
import type { UserAuthInfo, UserProfileResponse } from "./authService";
import type { CartItemResponse } from "./cartService";
import type { CategoryResponse } from "./categoryService";
import type { GiftBoxResponse } from "./giftBoxService";
import type { OrderResponse, OrderStatusApi } from "./orderService";
import type { ProductResponse } from "./productService";
import type { UserResponse } from "./userService";
import type { VoucherResponse } from "./voucherService";

const fallbackCategoryIcons = ["🎁", "🍫", "🍷", "🍵", "✨", "🧺"];
const fallbackCategoryColors = ["#8B1A2B", "#C9A84C", "#4A5D52", "#8B6914", "#A0522D", "#7C4D2A"];

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function matchByName<T extends { name: string }>(items: T[], name?: string | null) {
  const normalizedName = normalizeText(name);

  return items.find((item) => {
    const normalizedItemName = normalizeText(item.name);
    return (
      normalizedItemName === normalizedName ||
      normalizedItemName.includes(normalizedName) ||
      normalizedName.includes(normalizedItemName)
    );
  });
}

function pickProductImage(name: string, categoryName?: string, imageUrl?: string | null) {
  if (imageUrl) {
    return imageUrl;
  }

  const mockMatch = matchByName(mockProducts, name);
  if (mockMatch?.image) {
    return mockMatch.image;
  }

  const normalizedCategory = normalizeText(categoryName);

  if (normalizedCategory.includes("ruou") || normalizedCategory.includes("uong")) {
    return IMAGES.wine;
  }
  if (normalizedCategory.includes("tra") || normalizedCategory.includes("ca phe")) {
    return IMAGES.tea;
  }
  if (normalizedCategory.includes("cham soc")) {
    return IMAGES.skincare;
  }
  if (normalizedCategory.includes("tet") || normalizedCategory.includes("gio")) {
    return IMAGES.basket;
  }
  if (normalizedCategory.includes("thuc pham")) {
    return IMAGES.chocolate;
  }

  return IMAGES.hero;
}

function pickGiftBoxImage(name: string, imageUrl?: string | null) {
  if (imageUrl) {
    return imageUrl;
  }

  const mockMatch = matchByName(mockGiftBoxes, name);
  if (mockMatch?.image) {
    return mockMatch.image;
  }

  return IMAGES.giftBox;
}

function parseAddressParts(address?: string | null) {
  const parts = (address ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 4) {
    return {
      address: parts.slice(0, parts.length - 3).join(", "),
      ward: parts[parts.length - 3],
      district: parts[parts.length - 2],
      city: parts[parts.length - 1],
    };
  }

  return {
    address: parts[0] ?? address ?? "",
    ward: parts[1] ?? "",
    district: parts[2] ?? "",
    city: parts[3] ?? "",
  };
}

function mapApiStatus(status: OrderStatusApi): OrderStatus {
  if (status === 3) {
    return "shipping";
  }
  if (status === 4) {
    return "delivered";
  }
  if (status === 5 || status === 6) {
    return "cancelled";
  }
  if (status === 1 || status === 2) {
    return "confirmed";
  }
  return "pending";
}

function mapApiPaymentMethod(method?: string | null): PaymentMethodId {
  const normalized = (method ?? "").toLowerCase();

  if (normalized === "momo") {
    return "momo";
  }
  if (normalized === "banktransfer" || normalized === "bank") {
    return "bank";
  }
  if (normalized === "vnpay") {
    return "vnpay";
  }
  return "cod";
}

export function mapPaymentMethodToApi(method: PaymentMethodId) {
  if (method === "momo") {
    return "MoMo";
  }
  if (method === "bank") {
    return "BankTransfer";
  }
  if (method === "vnpay") {
    return "VNPAY";
  }
  return "COD";
}

export function mapUserProfile(
  user: UserAuthInfo | UserProfileResponse | UserResponse,
  profile?: UserProfileResponse | null,
): UserProfile {
  const resolvedProfile = profile ?? ("phone" in user ? user : undefined);

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: resolvedProfile?.phone || "",
    username: "username" in user ? user.username : undefined,
    address: resolvedProfile?.address || ("address" in user ? user.address : undefined),
    roleName: "roleName" in user ? user.roleName : undefined,
    createdAt: resolvedProfile?.createdAt || ("createdAt" in user ? user.createdAt : undefined),
    joinDate: resolvedProfile?.createdAt
      ? new Date(resolvedProfile.createdAt).toLocaleDateString("vi-VN")
      : "Mới tham gia",
  };
}

export function mapUserAddress(
  user: UserProfileResponse | UserResponse | UserProfile,
): Address[] {
  const parts = parseAddressParts("address" in user ? user.address : undefined);

  if (!parts.address && !parts.city) {
    return [];
  }

  return [
    {
      id: `profile-address-${user.id}`,
      label: "Địa chỉ chính",
      fullName: user.fullName,
      phone: user.phone || "",
      address: parts.address,
      ward: parts.ward,
      district: parts.district,
      city: parts.city,
      isDefault: true,
    },
  ];
}

export function mapCategory(category: CategoryResponse, index: number): Category {
  const mockMatch = matchByName(mockCategories, category.name);

  return {
    id: category.id,
    name: category.name,
    icon: mockMatch?.icon ?? fallbackCategoryIcons[index % fallbackCategoryIcons.length],
    color: mockMatch?.color ?? fallbackCategoryColors[index % fallbackCategoryColors.length],
  };
}

export function mapProduct(
  product: ProductResponse,
  categoryName?: string,
): Product {
  const mockMatch = matchByName(mockProducts, product.name);
  const imageUrl = product.images?.find((image) => image.isMain)?.url ?? product.images?.[0]?.url;
  const resolvedCategory = categoryName ?? product.categoryName ?? mockMatch?.category ?? "Khác";

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: mockMatch?.originalPrice,
    image: pickProductImage(product.name, resolvedCategory, imageUrl),
    category: resolvedCategory,
    categoryId: product.categoryId,
    rating: mockMatch?.rating ?? 4.8,
    reviewCount: mockMatch?.reviewCount ?? 0,
    badge: mockMatch?.badge,
    description: product.description || mockMatch?.description || "Đang cập nhật mô tả sản phẩm.",
    details:
      mockMatch?.details ??
      [
        product.sku ? `SKU: ${product.sku}` : null,
        product.isActive ? "Đang mở bán" : "Tạm ngưng bán",
      ].filter(Boolean) as string[],
    isNew: mockMatch?.isNew,
    isBestSeller: mockMatch?.isBestSeller,
  };
}

export function mapGiftBox(giftBox: GiftBoxResponse): GiftBox {
  const mockMatch = matchByName(mockGiftBoxes, giftBox.name);
  const imageUrl = giftBox.images?.find((image) => image.isMain)?.url ?? giftBox.images?.[0]?.url;

  return {
    id: giftBox.id,
    name: giftBox.name,
    price: giftBox.basePrice,
    originalPrice: mockMatch?.originalPrice,
    image: pickGiftBoxImage(giftBox.name, imageUrl),
    description: giftBox.description || mockMatch?.description || "Đang cập nhật mô tả hộp quà.",
    items:
      giftBox.boxComponents?.map(
        (component) =>
          `${component.productName ?? "Sản phẩm"} x${component.quantity}`,
      ) ??
      mockMatch?.items ??
      [],
    tag:
      mockMatch?.tag ??
      (giftBox.isCustom ? "Custom" : giftBox.isActive ? "Nổi bật" : "Tạm ngưng"),
  };
}

export function mapVoucher(voucher: VoucherResponse): Voucher {
  const now = Date.now();
  const start = new Date(voucher.startDate).getTime();
  const end = new Date(voucher.endDate).getTime();
  const isValid = voucher.isActive && now >= start && now <= end;

  return {
    id: voucher.id,
    code: voucher.code,
    title: voucher.code,
    description: voucher.description,
    discountType: voucher.isPercentage ? "percent" : "fixed",
    discountValue: voucher.value,
    minOrder: voucher.minOrderValue,
    maxDiscount: voucher.maxDiscountAmount ?? undefined,
    expiry: voucher.endDate,
    isValid,
  };
}

export function mapCartItem(item: CartItemResponse): CartItem {
  const type = item.giftBoxId ? "giftbox" : "product";
  const image = item.displayImageUrl || item.giftBoxImageUrl || item.productImageUrl;

  return {
    id: item.id,
    backendItemId: item.id,
    productId: item.giftBoxId ?? item.productId ?? item.id,
    name: item.displayName ?? item.giftBoxName ?? item.productName ?? "Sản phẩm",
    image: image || (type === "giftbox" ? IMAGES.giftBox : IMAGES.hero),
    price: item.unitPrice,
    quantity: item.quantity,
    type,
  };
}

export function mergeRemoteCartWithLocal(
  remoteItems: CartItemResponse[],
  localItems: CartItem[],
) {
  const customItems = localItems.filter((item) => item.type === "custom");
  return [...remoteItems.map(mapCartItem), ...customItems];
}

export function mapOrder(
  order: OrderResponse,
  productLookup?: Map<string, { id: string; name: string; image: string | null }>,
  giftBoxLookup?: Map<string, { id: string; name: string; image: string | null }>,
  user?: Pick<UserProfile, "fullName" | "phone">,
): Order {
  const addressParts = parseAddressParts(order.shippingAddress);

  return {
    id: order.orderNumber,
    backendId: order.id,
    status: mapApiStatus(order.currentStatus),
    items: order.orderDetails.map((detail) => {
      const lookup = detail.giftBoxId
        ? giftBoxLookup?.get(detail.giftBoxId)
        : detail.productId
          ? productLookup?.get(detail.productId)
          : undefined;

      return {
        productId: detail.giftBoxId ?? detail.productId ?? detail.id,
        name: lookup?.name ?? (detail.giftBoxId ? "Hộp quà" : "Sản phẩm"),
        image:
          lookup?.image ??
          (detail.giftBoxId ? IMAGES.giftBox : IMAGES.hero),
        price: detail.unitPrice,
        quantity: detail.quantity,
      };
    }),
    subtotal: order.totalAmount,
    discount: order.discountAmount,
    shipping: order.shippingFee,
    total: order.finalAmount,
    address: {
      id: `shipping-${order.id}`,
      label: "Giao hàng",
      fullName: user?.fullName ?? "Khách hàng",
      phone: user?.phone ?? "",
      address: addressParts.address,
      ward: addressParts.ward,
      district: addressParts.district,
      city: addressParts.city,
      isDefault: false,
    },
    paymentMethod: mapApiPaymentMethod(order.paymentMethod),
    note: order.note ?? undefined,
    createdAt: order.createdAt,
    timeline:
      order.orderHistories?.length > 0
        ? [...order.orderHistories]
            .sort(
              (left, right) =>
                new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
            )
            .map((history, index, histories) => ({
              status:
                history.note ||
                ["Chờ xác nhận", "Đã xác nhận", "Đang xử lý", "Đang giao hàng", "Đã giao hàng"][index] ||
                "Cập nhật đơn hàng",
              time: new Date(history.createdAt).toLocaleString("vi-VN"),
              done:
                index <
                histories.findIndex((item) => item.status === order.currentStatus) + 1,
            }))
        : [
            { status: "Đặt hàng thành công", time: new Date(order.createdAt).toLocaleString("vi-VN"), done: true },
            { status: "Đã tiếp nhận", time: "--", done: order.currentStatus >= 1 },
            { status: "Đang vận chuyển", time: "--", done: order.currentStatus >= 3 },
            { status: "Giao hàng thành công", time: "--", done: order.currentStatus >= 4 },
          ],
  };
}
