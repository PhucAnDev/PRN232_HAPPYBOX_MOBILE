import { mapOrder, mapUserAddress, mapUserProfile } from "./apiMappers";
import giftBoxService from "./giftBoxService";
import orderService, { OrderResponse } from "./orderService";
import productService from "./productService";
import userService from "./userService";
import type { Order, UserProfile, Address } from "../types/domain";

async function buildCatalogLookups() {
  const [productsResponse, giftBoxesResponse] = await Promise.all([
    productService.getAll(),
    giftBoxService.getAll(),
  ]);

  const productLookup = new Map(
    productsResponse.data.data.map((product) => [
      product.id,
      {
        id: product.id,
        name: product.name,
        image:
          product.images?.find((image) => image.isMain)?.url ??
          product.images?.[0]?.url ??
          null,
      },
    ]),
  );

  const giftBoxLookup = new Map(
    giftBoxesResponse.data.data.map((giftBox) => [
      giftBox.id,
      {
        id: giftBox.id,
        name: giftBox.name,
        image:
          giftBox.images?.find((image) => image.isMain)?.url ??
          giftBox.images?.[0]?.url ??
          null,
      },
    ]),
  );

  return { productLookup, giftBoxLookup };
}

function sortOrders(orders: OrderResponse[]) {
  return [...orders].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function fetchUserProfileData(userId: string): Promise<UserProfile> {
  const response = await userService.getById(userId);
  return mapUserProfile(response.data.data);
}

export async function fetchUserAddresses(userId: string): Promise<Address[]> {
  const response = await userService.getById(userId);
  return mapUserAddress(response.data.data);
}

export async function fetchUserOrders(userId: string, user?: UserProfile | null): Promise<Order[]> {
  const [{ data: ordersPayload }, lookups] = await Promise.all([
    orderService.getByUserId(userId),
    buildCatalogLookups(),
  ]);

  return sortOrders(ordersPayload.data).map((order) =>
    mapOrder(order, lookups.productLookup, lookups.giftBoxLookup, user ?? undefined),
  );
}

export async function fetchOrderByBackendId(
  orderId: string,
  user?: UserProfile | null,
): Promise<Order> {
  const [{ data: orderPayload }, lookups] = await Promise.all([
    orderService.getById(orderId),
    buildCatalogLookups(),
  ]);

  return mapOrder(
    orderPayload.data,
    lookups.productLookup,
    lookups.giftBoxLookup,
    user ?? undefined,
  );
}
