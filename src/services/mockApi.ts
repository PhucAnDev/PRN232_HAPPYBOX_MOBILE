import { boxTypes, paymentMethods } from "../constants/content";
import {
  botResponses,
  categories,
  giftBoxes,
  initialChat,
  initialOrders,
  mockAddresses,
  mockUser,
  notifications,
  products,
  vouchers,
} from "../mocks/data";
import {
  Address,
  ChatMessage,
  Order,
  Product,
  UserProfile,
  Voucher,
} from "../types/domain";

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  auth: {
    signIn: async (email: string, _password: string): Promise<UserProfile> => {
      await wait(600);
      return { ...mockUser, email };
    },
    signUp: async (payload: {
      fullName: string;
      email: string;
      phone: string;
    }): Promise<UserProfile> => {
      await wait(700);
      return {
        ...mockUser,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
      };
    },
    forgotPassword: async (_email: string) => {
      await wait(500);
      return { success: true };
    },
  },
  products: {
    list: async (): Promise<Product[]> => {
      await wait(250);
      return products;
    },
    detail: async (productId: string) => {
      await wait(200);
      return products.find((item) => item.id === productId) ?? null;
    },
    categories: async () => {
      await wait(200);
      return categories;
    },
  },
  giftBoxes: {
    list: async () => {
      await wait(250);
      return giftBoxes;
    },
    detail: async (giftBoxId: string) => {
      await wait(200);
      return giftBoxes.find((item) => item.id === giftBoxId) ?? null;
    },
    boxTypes: async () => {
      await wait(120);
      return boxTypes;
    },
  },
  vouchers: {
    list: async (): Promise<Voucher[]> => {
      await wait(220);
      return vouchers;
    },
  },
  orders: {
    list: async (): Promise<Order[]> => {
      await wait(240);
      return initialOrders;
    },
  },
  address: {
    list: async (): Promise<Address[]> => {
      await wait(180);
      return mockAddresses;
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
};
