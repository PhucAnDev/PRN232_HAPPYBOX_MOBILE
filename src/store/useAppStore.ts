import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mockAddresses, mockUser, notifications } from "../mocks/data";
import { api } from "../services/mockApi";
import { session } from "../services/session";
import {
  Address,
  AppNotification,
  AuthTokens,
  CartItem,
  CheckoutDraft,
  CustomGiftBoxDraft,
  Order,
  UserProfile,
  Voucher,
} from "../types/domain";
import { calculateCartSummary } from "../utils/format";

interface AppState {
  onboardingDone: boolean;
  isAuthenticated: boolean;
  authTokens: AuthTokens | null;
  user: UserProfile | null;
  cartItems: CartItem[];
  appliedVoucher: Voucher | null;
  wishlist: string[];
  addresses: Address[];
  orders: Order[];
  notifications: AppNotification[];
  customBoxDraft: CustomGiftBoxDraft | null;
  checkoutDraft: CheckoutDraft | null;
  completeOnboarding: () => void;
  setAuthTokens: (tokens: AuthTokens | null) => void;
  setUser: (user: UserProfile | null) => void;
  setCartItems: (items: CartItem[]) => void;
  setOrders: (orders: Order[]) => void;
  login: (user: UserProfile, tokens?: AuthTokens) => void;
  signup: (user: UserProfile, tokens?: AuthTokens) => void;
  logout: () => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => Promise<boolean>;
  updateCartQuantity: (id: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  applyVoucher: (voucher: Voucher | null) => void;
  toggleWishlist: (productId: string) => void;
  setCustomBoxDraft: (draft: CustomGiftBoxDraft | null) => void;
  setCheckoutDraft: (draft: CheckoutDraft | null) => void;
  getCartCount: () => number;
  getCartSummary: () => {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  upsertAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  updateProfile: (payload: Partial<UserProfile>) => void;
  addNotification: (
    notification: Omit<AppNotification, "id" | "createdAt" | "isRead"> &
      Partial<Pick<AppNotification, "id" | "createdAt" | "isRead">>,
  ) => void;
  markNotificationRead: (notificationId: string) => void;
  placeOrder: () => Order | null;
}

const clonedAddresses = () => mockAddresses.map((item) => ({ ...item }));
const clonedNotifications = () => notifications.map((item) => ({ ...item }));
const MAX_NOTIFICATIONS = 80;

const orderStatusDescriptions: Record<Order["status"], string> = {
  pending: "\u0111ang ch\u1edd x\u00e1c nh\u1eadn.",
  confirmed: "\u0111\u00e3 \u0111\u01b0\u1ee3c x\u00e1c nh\u1eadn.",
  shipping: "\u0111ang \u0111\u01b0\u1ee3c giao.",
  delivered: "\u0111\u00e3 giao th\u00e0nh c\u00f4ng.",
  cancelled: "\u0111\u00e3 b\u1ecb h\u1ee7y.",
};

const prependNotification = (
  current: AppNotification[],
  notification: Omit<AppNotification, "id" | "createdAt" | "isRead"> &
    Partial<Pick<AppNotification, "id" | "createdAt" | "isRead">>,
) => {
  const next: AppNotification = {
    ...notification,
    id: notification.id ?? `noti-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: notification.createdAt ?? new Date().toISOString(),
    isRead: notification.isRead ?? false,
  };

  const isDuplicate = current.some((item) => {
    if (item.id === next.id) {
      return true;
    }

    if (
      next.kind === "order" &&
      item.kind === "order" &&
      next.orderId &&
      item.orderId &&
      next.orderStatus &&
      item.orderStatus
    ) {
      return item.orderId === next.orderId && item.orderStatus === next.orderStatus;
    }

    return false;
  });

  if (isDuplicate) {
    return current;
  }

  return [next, ...current].slice(0, MAX_NOTIFICATIONS);
};

const isGuid = (value: string | undefined | null): value is string => {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
};

const getCartItemSyncKey = (item: CartItem) => {
  if (item.type === "product") {
    return `product:${item.backendProductId ?? item.productId}`;
  }

  if (item.type === "giftbox") {
    return `giftbox:${item.backendGiftBoxId ?? item.productId}`;
  }

  return `custom:${item.id}`;
};

const isLocalOnlyCartItem = (item: CartItem) =>
  item.type === "custom" ||
  item.id.startsWith("cart-") ||
  (!item.backendProductId && !item.backendGiftBoxId && !isGuid(item.productId));

const mergeRemoteCartWithLocalFallback = (remoteItems: CartItem[], localItems: CartItem[]) => {
  if (remoteItems.length === 0) {
    return localItems.filter(isLocalOnlyCartItem);
  }

  const remoteKeys = new Set(remoteItems.map(getCartItemSyncKey));
  const localFallback = localItems.filter(
    (item) => isLocalOnlyCartItem(item) && !remoteKeys.has(getCartItemSyncKey(item)),
  );

  return [...remoteItems, ...localFallback];
};

const isCartItemGoneOnServer = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false;

  if (error.response?.status === 404) return true;

  const responseData = error.response?.data as
    | {
        message?: string;
        title?: string;
        detail?: string;
      }
    | undefined;

  const message = `${responseData?.message || ""} ${responseData?.title || ""} ${
    responseData?.detail || ""
  }`
    .toLowerCase()
    .trim();

  if (!message) return false;

  return (
    message.includes("not found") ||
    message.includes("does not exist") ||
    message.includes("khong ton tai") ||
    message.includes("khÃ´ng tá»“n táº¡i")
  );
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboardingDone: false,
      isAuthenticated: false,
      authTokens: null,
      user: null,
      cartItems: [],
      appliedVoucher: null,
      wishlist: [],
      addresses: clonedAddresses(),
      orders: [],
      notifications: clonedNotifications(),
      customBoxDraft: null,
      checkoutDraft: null,
      completeOnboarding: () => set({ onboardingDone: true }),
      setAuthTokens: (tokens) => {
        set((state) => ({
          authTokens: tokens,
          isAuthenticated: Boolean(tokens?.accessToken) && Boolean(state.user),
        }));
        session.setTokens(tokens);
      },
      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(state.authTokens?.accessToken) && Boolean(user),
        })),
      setCartItems: (items) => set({ cartItems: items }),
      setOrders: (orders) =>
        set((state) => {
          if (state.orders.length === 0) {
            return { orders };
          }

          const previousById = new Map(state.orders.map((item) => [item.id, item]));
          let nextNotifications = state.notifications;

          orders.forEach((order) => {
            const previous = previousById.get(order.id);
            const normalizedOrderNumber = order.orderNumber?.trim() || "";
            const orderLabel = normalizedOrderNumber ? `\u0110\u01a1n ${normalizedOrderNumber}` : "\u0110\u01a1n h\u00e0ng";
            if (!previous) {
              nextNotifications = prependNotification(nextNotifications, {
                title: "C\u00f3 \u0111\u01a1n h\u00e0ng m\u1edbi",
                body: `${orderLabel} v\u1eeba xu\u1ea5t hi\u1ec7n trong l\u1ecbch s\u1eed mua h\u00e0ng.`,
                kind: "order",
                orderId: order.id,
                orderNumber: normalizedOrderNumber || undefined,
                orderStatus: order.status,
              });
              return;
            }

            if (previous.status !== order.status) {
              nextNotifications = prependNotification(nextNotifications, {
                title: "\u0110\u01a1n h\u00e0ng c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i",
                body: `${orderLabel} ${orderStatusDescriptions[order.status]}`,
                kind: "order",
                orderId: order.id,
                orderNumber: normalizedOrderNumber || undefined,
                orderStatus: order.status,
              });
            }
          });

          return {
            orders,
            notifications: nextNotifications,
          };
        }),
      login: (user, tokens) => {
        set({
          isAuthenticated: true,
          user,
          authTokens: tokens ?? get().authTokens,
        });

        if (tokens) {
          session.setTokens(tokens);
        }

        if (tokens) {
          void api.cart
            .get()
            .then((remoteItems) =>
              set((state) => ({
                cartItems: mergeRemoteCartWithLocalFallback(remoteItems, state.cartItems),
              })),
            )
            .catch(() => undefined);

          if (isGuid(user.id)) {
            void api.orders
              .listByUser(user.id)
              .then((remoteOrders) => set({ orders: remoteOrders }))
              .catch(() => undefined);
          }
        }
      },
      signup: (user, tokens) => {
        set({
          isAuthenticated: true,
          user,
          authTokens: tokens ?? get().authTokens,
        });

        if (tokens) {
          session.setTokens(tokens);
        }

        if (tokens) {
          void api.cart
            .get()
            .then((remoteItems) =>
              set((state) => ({
                cartItems: mergeRemoteCartWithLocalFallback(remoteItems, state.cartItems),
              })),
            )
            .catch(() => undefined);

          if (isGuid(user.id)) {
            void api.orders
              .listByUser(user.id)
              .then((remoteOrders) => set({ orders: remoteOrders }))
              .catch(() => undefined);
          }
        }
      },
      logout: () => {
        session.setTokens(null);
        void api.auth.logoutSession().catch(() => undefined);

        set({
          isAuthenticated: false,
          authTokens: null,
          user: null,
          cartItems: [],
          appliedVoucher: null,
          orders: [],
          checkoutDraft: null,
        });
      },
      addToCart: (item) => {
        const optimisticId = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        set((state) => {
          const existing = state.cartItems.find(
            (cartItem) =>
              cartItem.productId === item.productId && cartItem.type === item.type,
          );

          if (existing) {
            return {
              cartItems: state.cartItems.map((cartItem) =>
                cartItem.id === existing.id
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem,
              ),
            };
          }

          return {
            cartItems: [...state.cartItems, { ...item, id: optimisticId }],
          };
        });

        const state = get();
        if (!state.isAuthenticated || item.type === "custom" || !isGuid(item.productId)) {
          return;
        }

        const payload =
          item.type === "giftbox"
            ? { giftBoxId: item.productId, quantity: item.quantity }
            : { productId: item.productId, quantity: item.quantity };

        void api.cart
          .addItem(payload)
          .then((remoteItems) =>
            set((state) => ({
              cartItems: mergeRemoteCartWithLocalFallback(remoteItems, state.cartItems),
            })),
          )
          .catch(() => {
            void api.cart
              .get()
              .then((remoteItems) =>
                set((state) => ({
                  cartItems: mergeRemoteCartWithLocalFallback(remoteItems, state.cartItems),
                })),
              )
              .catch(() => undefined);
          });
      },
      removeFromCart: async (id) => {
        const previousItems = get().cartItems;
        const shouldSync = get().isAuthenticated && isGuid(id);

        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        }));

        if (!shouldSync) return true;

        try {
          await api.cart.removeItem(id);
          return true;
        } catch (error) {
          if (isCartItemGoneOnServer(error)) {
            return true;
          }

          try {
            const remoteItems = await api.cart.get();
            const syncedItems = mergeRemoteCartWithLocalFallback(remoteItems, get().cartItems);
            set({ cartItems: syncedItems });
            if (!syncedItems.some((item) => item.id === id)) {
              return true;
            }
          } catch {
            // Keep optimistic rollback below.
          }

          set({ cartItems: previousItems });
          return false;
        }
      },
      updateCartQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          return get().removeFromCart(id);
        }

        const previousItems = get().cartItems;
        const shouldSync = get().isAuthenticated && isGuid(id);

        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        }));

        if (!shouldSync) return true;

        try {
          const remoteItems = await api.cart.updateItem(id, quantity);
          set((state) => ({
            cartItems: mergeRemoteCartWithLocalFallback(remoteItems, state.cartItems),
          }));
          return true;
        } catch (error) {
          if (isCartItemGoneOnServer(error)) {
            set((state) => ({
              cartItems: state.cartItems.filter((item) => item.id !== id),
            }));
            return true;
          }

          try {
            const remoteItems = await api.cart.get();
            const syncedItems = mergeRemoteCartWithLocalFallback(remoteItems, get().cartItems);
            set({ cartItems: syncedItems });
            const syncedItem = syncedItems.find((item) => item.id === id);
            if (!syncedItem || syncedItem.quantity === quantity) {
              return true;
            }
          } catch {
            // Keep optimistic rollback below.
          }

          set({ cartItems: previousItems });
          return false;
        }
      },
      clearCart: async () => {
        const current = get();
        const shouldSync = current.isAuthenticated;
        const previousCartItems = current.cartItems;
        const previousVoucher = current.appliedVoucher;
        const previousDraft = current.customBoxDraft;

        set({ cartItems: [], appliedVoucher: null, customBoxDraft: null });

        if (!shouldSync) return true;

        try {
          await api.cart.clear();
          return true;
        } catch {
          set({
            cartItems: previousCartItems,
            appliedVoucher: previousVoucher,
            customBoxDraft: previousDraft,
          });
          return false;
        }
      },
      applyVoucher: (voucher) => set({ appliedVoucher: voucher }),
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((item) => item !== productId)
            : [...state.wishlist, productId],
        })),
      setCustomBoxDraft: (draft) => set({ customBoxDraft: draft }),
      setCheckoutDraft: (draft) => set({ checkoutDraft: draft }),
      getCartCount: () =>
        get().cartItems.reduce((total, item) => total + item.quantity, 0),
      getCartSummary: () => {
        const subtotal = get().cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
        return calculateCartSummary(subtotal, get().appliedVoucher);
      },
      upsertAddress: (address) =>
        set((state) => {
          const exists = state.addresses.some((item) => item.id === address.id);
          const next = exists
            ? state.addresses.map((item) =>
                item.id === address.id
                  ? address
                  : address.isDefault
                    ? { ...item, isDefault: false }
                    : item,
              )
            : [
                ...state.addresses.map((item) =>
                  address.isDefault ? { ...item, isDefault: false } : item,
                ),
                address,
              ];

          return { addresses: next };
        }),
      deleteAddress: (addressId) =>
        set((state) => ({
          addresses: state.addresses.filter((item) => item.id !== addressId),
        })),
      setDefaultAddress: (addressId) =>
        set((state) => ({
          addresses: state.addresses.map((item) => ({
            ...item,
            isDefault: item.id === addressId,
          })),
        })),
      updateProfile: (payload) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...payload } : { ...mockUser, ...payload },
        })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: prependNotification(state.notifications, notification),
        })),
      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === notificationId ? { ...item, isRead: true } : item,
          ),
        })),
      placeOrder: () => {
        const state = get();
        const draft = state.checkoutDraft;
        if (!draft || state.cartItems.length === 0) {
          return null;
        }

        const summary = state.getCartSummary();
        const address =
          state.addresses.find((item) => item.id === draft.addressId) ??
          state.addresses.find((item) => item.isDefault) ??
          state.addresses[0];

        if (!address) {
          return null;
        }

        const order: Order = {
          id: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
          status: draft.paymentMethod === "cod" ? "confirmed" : "pending",
          items: state.cartItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: summary.subtotal,
          discount: summary.discount,
          shipping: summary.shipping,
          total: summary.total,
          address,
          paymentMethod: draft.paymentMethod,
          note: draft.note,
          createdAt: new Date().toISOString(),
          timeline: [
            { status: "Äáº·t hÃ ng thÃ nh cÃ´ng", time: "Vá»«a xong", done: true },
            {
              status: "ÄÃ£ tiáº¿p nháº­n",
              time: "Chá» xá»­ lÃ½",
              done: draft.paymentMethod === "cod",
            },
            { status: "Äang váº­n chuyá»ƒn", time: "--", done: false },
            { status: "Giao hÃ ng thÃ nh cÃ´ng", time: "--", done: false },
          ],
        };

        set({
          orders: [order, ...state.orders],
          cartItems: [],
          appliedVoucher: null,
          checkoutDraft: null,
          customBoxDraft: null,
          notifications: prependNotification(state.notifications, {
            title: "\u0110\u01a1n h\u00e0ng m\u1edbi \u0111\u00e3 \u0111\u01b0\u1ee3c t\u1ea1o",
            body: `${
              order.orderNumber?.trim() ? `\u0110\u01a1n ${order.orderNumber.trim()}` : "\u0110\u01a1n h\u00e0ng"
            } \u0111ang \u0111\u01b0\u1ee3c h\u1ec7 th\u1ed1ng x\u1eed l\u00fd.`,
            kind: "order",
            orderId: order.id,
            orderNumber: order.orderNumber?.trim() || undefined,
            orderStatus: order.status,
          }),
        });

        return order;
      },
    }),
    {
      name: "giftbox-mobile-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingDone: state.onboardingDone,
        isAuthenticated: state.isAuthenticated,
        authTokens: state.authTokens,
        user: state.user,
        cartItems: state.cartItems,
        appliedVoucher: state.appliedVoucher,
        wishlist: state.wishlist,
        addresses: state.addresses,
        orders: state.orders,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        session.setTokens(state?.authTokens ?? null);
      },
    },
  ),
);

session.subscribe((tokens) => {
  const state = useAppStore.getState();
  const sameTokens =
    state.authTokens?.accessToken === tokens?.accessToken &&
    state.authTokens?.refreshToken === tokens?.refreshToken;

  if (sameTokens) return;

  if (!tokens) {
    useAppStore.setState({
      isAuthenticated: false,
      authTokens: null,
      user: null,
      cartItems: [],
      appliedVoucher: null,
      orders: [],
      checkoutDraft: null,
    });
    return;
  }

  useAppStore.setState({
    authTokens: tokens,
    isAuthenticated: Boolean(state.user),
  });

  if (state.user) {
    return;
  }

  void api.auth
    .profile()
    .then((profile) => {
      const current = useAppStore.getState();
      if (current.authTokens?.accessToken !== tokens.accessToken) {
        return;
      }

      useAppStore.setState({
        user: profile,
        isAuthenticated: true,
      });

      void api.cart
        .get()
        .then((remoteItems) =>
          useAppStore.setState((current) => ({
            cartItems: mergeRemoteCartWithLocalFallback(remoteItems, current.cartItems),
          })),
        )
        .catch(() => undefined);

      if (isGuid(profile.id)) {
        void api.orders
          .listByUser(profile.id)
          .then((remoteOrders) => useAppStore.setState({ orders: remoteOrders }))
          .catch(() => undefined);
      }
    })
    .catch(() => {
      session.setTokens(null);
    });
});


