import { USE_MOCK_API } from "../constants/env";
import type { ChatMessage } from "../types/domain";
import { mapCategory, mapGiftBox, mapProduct, mapUserProfile, mapVoucher } from "./apiMappers";
import authService from "./authService";
import categoryService from "./categoryService";
import { clearAuthSession, saveAuthSession } from "./authSession";
import chatbotService from "./chatbotService";
import giftBoxService from "./giftBoxService";
import { mockDataApi } from "./mockDataApi";
import productService from "./productService";
import voucherService from "./voucherService";

function makeUsername(email: string, fullName: string) {
  const emailPrefix = email.split("@")[0]?.trim();
  if (emailPrefix) {
    return emailPrefix;
  }

  return fullName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "");
}

async function withProfileFallback() {
  try {
    const profileResponse = await authService.getProfile();
    return profileResponse.data.data;
  } catch {
    return null;
  }
}

async function listCategories() {
  const response = await categoryService.getAll();
  return response.data.data.map(mapCategory);
}

async function listProducts() {
  const [productsResponse, categoriesResponse] = await Promise.all([
    productService.getAll(),
    categoryService.getAll(),
  ]);

  const categoryMap = new Map(
    categoriesResponse.data.data.map((category) => [category.id, category.name]),
  );

  return productsResponse.data.data.map((product) =>
    mapProduct(product, categoryMap.get(product.categoryId)),
  );
}

async function getProductDetail(productId: string) {
  const [productResponse, categoriesResponse] = await Promise.all([
    productService.getById(productId),
    categoryService.getAll(),
  ]);

  const categoryMap = new Map(
    categoriesResponse.data.data.map((category) => [category.id, category.name]),
  );

  return mapProduct(
    productResponse.data.data,
    categoryMap.get(productResponse.data.data.categoryId),
  );
}

async function listGiftBoxes() {
  const response = await giftBoxService.getActive();
  return response.data.data.map(mapGiftBox);
}

async function getGiftBoxDetail(giftBoxId: string) {
  const response = await giftBoxService.getById(giftBoxId);
  return mapGiftBox(response.data.data);
}

async function listVouchers() {
  const response = await voucherService.getAll();
  return response.map(mapVoucher);
}

export const api = {
  auth: {
    signIn: async (email: string, password: string) => {
      if (USE_MOCK_API) {
        return mockDataApi.auth.signIn(email, password);
      }

      const loginResponse = await authService.login({ email, password });
      const session = loginResponse.data.data;
      await saveAuthSession(session.accessToken, session.refreshToken);
      const profile = await withProfileFallback();
      return mapUserProfile(session.user, profile);
    },
    signUp: async (payload: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      if (USE_MOCK_API) {
        return mockDataApi.auth.signUp(payload);
      }

      await authService.register({
        username: makeUsername(payload.email, payload.fullName),
        email: payload.email,
        password: payload.password,
        fullName: payload.fullName,
        phone: payload.phone,
      });

      return api.auth.signIn(payload.email, payload.password);
    },
    forgotPassword: async (email: string) => {
      if (USE_MOCK_API) {
        return mockDataApi.auth.forgotPassword(email);
      }

      await authService.forgotPassword(email);
      return { success: true };
    },
    signOut: async () => {
      await clearAuthSession();
    },
  },
  products: {
    list: async () => {
      if (USE_MOCK_API) {
        return mockDataApi.products.list();
      }

      return listProducts();
    },
    detail: async (productId: string) => {
      if (USE_MOCK_API) {
        return mockDataApi.products.detail(productId);
      }

      return getProductDetail(productId);
    },
    categories: async () => {
      if (USE_MOCK_API) {
        return mockDataApi.products.categories();
      }

      return listCategories();
    },
  },
  giftBoxes: {
    list: async () => {
      if (USE_MOCK_API) {
        return mockDataApi.giftBoxes.list();
      }

      return listGiftBoxes();
    },
    detail: async (giftBoxId: string) => {
      if (USE_MOCK_API) {
        return mockDataApi.giftBoxes.detail(giftBoxId);
      }

      return getGiftBoxDetail(giftBoxId);
    },
    boxTypes: mockDataApi.giftBoxes.boxTypes,
  },
  vouchers: {
    list: async () => {
      if (USE_MOCK_API) {
        return mockDataApi.vouchers.list();
      }

      return listVouchers();
    },
  },
  orders: mockDataApi.orders,
  address: mockDataApi.address,
  support: {
    paymentMethods: mockDataApi.support.paymentMethods,
    notifications: mockDataApi.support.notifications,
    initialChat: async (): Promise<ChatMessage[]> => mockDataApi.support.initialChat(),
    askBot: async (text: string) => {
      if (USE_MOCK_API) {
        return mockDataApi.support.askBot(text);
      }

      const response = await chatbotService.sendMessage(text);
      return response.data.data.response;
    },
  },
};
