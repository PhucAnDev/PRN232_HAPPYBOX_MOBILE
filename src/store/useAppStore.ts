import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { USE_MOCK_API } from "../constants/env";
import { mockAddresses, mockUser, notifications } from "../mocks/data";
import cartService from "../services/cartService";
import { getAccessToken } from "../services/authSession";
import { mergeRemoteCartWithLocal, mapPaymentMethodToApi, mapOrder } from "../services/apiMappers";
import {
  Address,
  AppNotification,
  CartItem,
  CheckoutDraft,
  CustomGiftBoxDraft,
  Order,
  UserProfile,
  Voucher,
} from "../types/domain";
import { calculateCartSummary } from "../utils/format";
import { api } from "../services/mockApi";

interface AppState {
  onboardingDone: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  cartItems: CartItem[];
  appliedVoucher: Voucher | null;
  wishlist: string[];
  addresses: Address[];
  orders: Order[];
  notifications: AppNotification[];
  customBoxDraft: CustomGiftBoxDraft | null;
  checkoutDraft: CheckoutDraft | null;
  hydrateUser: (user: UserProfile | null) => void;
  hydrateCartItems: (items: CartItem[]) => void;
  hydrateOrders: (orders: Order[]) => void;
  hydrateAddresses: (addresses: Address[]) => void;
  upsertOrder: (order: Order) => void;
  completeOnboarding: () => void;
  login: (user: UserProfile) => void;
  signup: (user: UserProfile) => void;
  logout: () => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
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
  markNotificationRead: (notificationId: string) => void;
  placeOrder: () => Promise<Order | null>;
}

const clonedAddresses = () => mockAddresses.map((item) => ({ ...item }));
const clonedNotifications = () => notifications.map((item) => ({ ...item }));

async function hasRemoteSession(isAuthenticated: boolean) {
  if (USE_MOCK_API || !isAuthenticated) {
    return false;
  }

  return Boolean(await getAccessToken());
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboardingDone: false,
      isAuthenticated: false,
      user: null,
      cartItems: [],
      appliedVoucher: null,
      wishlist: [],
      addresses: clonedAddresses(),
      orders: [],
      notifications: clonedNotifications(),
      customBoxDraft: null,
      checkoutDraft: null,
      hydrateUser: (user) => set({ user }),
      hydrateCartItems: (items) => set({ cartItems: items }),
      hydrateOrders: (orders) => set({ orders }),
      hydrateAddresses: (addresses) => set({ addresses }),
      upsertOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders.filter((item) => item.id !== order.id)],
        })),
      completeOnboarding: () => set({ onboardingDone: true }),
      login: (user) => set({ isAuthenticated: true, user }),
      signup: (user) => set({ isAuthenticated: true, user }),
      logout: () => {
        void api.auth.signOut();
        set({
          isAuthenticated: false,
          user: null,
          cartItems: [],
          appliedVoucher: null,
          checkoutDraft: null,
        });
      },
      addToCart: (item) =>
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

          const nextState = {
            cartItems: [
              ...state.cartItems,
              {
                ...item,
                id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              },
            ],
          };

          void (async () => {
            if (!(await hasRemoteSession(get().isAuthenticated)) || item.type === "custom") {
              return;
            }

            try {
              const remoteCart = await cartService.addItemToCart({
                productId: item.type === "product" ? item.productId : null,
                giftBoxId: item.type === "giftbox" ? item.productId : null,
                quantity: item.quantity,
              });

              set((currentState) => ({
                cartItems: mergeRemoteCartWithLocal(remoteCart.items, currentState.cartItems),
              }));
            } catch {
              // Keep optimistic local cart if remote sync fails.
            }
          })();

          return nextState;
        }),
      removeFromCart: (id) =>
        set((state) => {
          const target = state.cartItems.find((item) => item.id === id);
          const nextState = {
            cartItems: state.cartItems.filter((item) => item.id !== id),
          };

          void (async () => {
            if (
              !(await hasRemoteSession(get().isAuthenticated)) ||
              !target?.backendItemId ||
              target.type === "custom"
            ) {
              return;
            }

            try {
              await cartService.removeCartItem(target.backendItemId);
            } catch {
              // Keep local change if backend removal fails.
            }
          })();

          return nextState;
        }),
      updateCartQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }

        set((state) => {
          const target = state.cartItems.find((item) => item.id === id);
          const nextState = {
            cartItems: state.cartItems.map((item) =>
              item.id === id ? { ...item, quantity } : item,
            ),
          };

          void (async () => {
            if (
              !(await hasRemoteSession(get().isAuthenticated)) ||
              !target?.backendItemId ||
              target.type === "custom"
            ) {
              return;
            }

            try {
              const remoteCart = await cartService.updateCartItem(target.backendItemId, {
                quantity,
              });

              set((currentState) => ({
                cartItems: mergeRemoteCartWithLocal(remoteCart.items, currentState.cartItems),
              }));
            } catch {
              // Keep optimistic quantity if remote update fails.
            }
          })();

          return nextState;
        });
      },
      clearCart: () => {
        void (async () => {
          if (!(await hasRemoteSession(get().isAuthenticated))) {
            return;
          }

          try {
            await cartService.clearCart();
          } catch {
            // Ignore remote clear errors and still clear local cart.
          }
        })();

        set({ cartItems: [], appliedVoucher: null, customBoxDraft: null });
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
      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === notificationId ? { ...item, isRead: true } : item,
          ),
        })),
      placeOrder: async () => {
        const state = get();
        const draft = state.checkoutDraft;
        if (!draft || state.cartItems.length === 0) {
          return null;
        }

        const summary = state.getCartSummary();
        if (
          !draft.fullName.trim() ||
          !draft.phone.trim() ||
          !draft.address.trim() ||
          !draft.ward.trim() ||
          !draft.district.trim() ||
          !draft.city.trim()
        ) {
          return null;
        }

        const shippingAddress = [draft.address, draft.ward, draft.district, draft.city]
          .filter(Boolean)
          .join(", ");
        const address: Address = {
          id: `checkout-${Date.now()}`,
          label: "Giao hang",
          fullName: draft.fullName.trim(),
          phone: draft.phone.trim(),
          address: draft.address.trim(),
          ward: draft.ward.trim(),
          district: draft.district.trim(),
          city: draft.city.trim(),
          isDefault: false,
        };

        const canUseRemoteCheckout =
          (await hasRemoteSession(state.isAuthenticated)) &&
          state.cartItems.every((item) => item.type !== "custom");

        if (canUseRemoteCheckout) {
          try {
            const selectedRemoteItemIds = state.cartItems
              .map((item) => item.backendItemId)
              .filter((itemId): itemId is string => Boolean(itemId));

            const remoteOrder = await cartService.checkout({
              shippingAddress,
              shippingPhone: address.phone,
              paymentMethod: mapPaymentMethodToApi(draft.paymentMethod),
              voucherCode: state.appliedVoucher?.code ?? null,
              note: draft.note || null,
              selectedItemIds: selectedRemoteItemIds.length > 0 ? selectedRemoteItemIds : null,
            });

            const mappedOrder = mapOrder(
              remoteOrder,
              undefined,
              undefined,
              state.user ?? undefined,
            );

            const orderWithLocalItems: Order = {
              ...mappedOrder,
              items: state.cartItems.map((item) => ({
                productId: item.productId,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
              })),
              address: {
                ...mappedOrder.address,
                ...address,
              },
            };

            set({
              orders: [orderWithLocalItems, ...state.orders.filter((item) => item.id !== orderWithLocalItems.id)],
              cartItems: [],
              appliedVoucher: null,
              checkoutDraft: null,
              customBoxDraft: null,
            });

            return orderWithLocalItems;
          } catch {
            return null;
          }
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
            { status: "Đặt hàng thành công", time: "Vừa xong", done: true },
            {
              status: "Đã tiếp nhận",
              time: "Chờ xử lý",
              done: draft.paymentMethod === "cod",
            },
            { status: "Đang vận chuyển", time: "--", done: false },
            { status: "Giao hàng thành công", time: "--", done: false },
          ],
        };

        set({
          orders: [order, ...state.orders],
          cartItems: [],
          appliedVoucher: null,
          checkoutDraft: null,
          customBoxDraft: null,
          notifications: [
            {
              id: `noti-${Date.now()}`,
              title: "Đơn hàng mới đã được tạo",
              body: `${order.id} đang được hệ thống xử lý.`,
              kind: "order",
              createdAt: new Date().toISOString(),
              isRead: false,
            },
            ...state.notifications,
          ],
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
        user: state.user,
        cartItems: state.cartItems,
        appliedVoucher: state.appliedVoucher,
        wishlist: state.wishlist,
        addresses: state.addresses,
        orders: state.orders,
        notifications: state.notifications,
      }),
    },
  ),
);
