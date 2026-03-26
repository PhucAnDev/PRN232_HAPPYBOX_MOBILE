import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { STORAGE_KEYS } from "../constants/storage";

const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface MomoExtraDataPayload {
  orderId?: string;
}

function isGuid(value: string | null | undefined): value is string {
  return Boolean(value && GUID_REGEX.test(value));
}

function decodeExtraData(extraData: string | null | undefined): MomoExtraDataPayload | null {
  if (!extraData || typeof globalThis.atob !== "function") {
    return null;
  }

  try {
    return JSON.parse(globalThis.atob(extraData)) as MomoExtraDataPayload;
  } catch {
    return null;
  }
}

export function buildMomoReturnUrl() {
  return Linking.createURL("payment/momo-return");
}

export async function savePendingMomoOrderId(orderId: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.pendingMomoOrderId, orderId);
}

export async function getPendingMomoOrderId() {
  return AsyncStorage.getItem(STORAGE_KEYS.pendingMomoOrderId);
}

export async function clearPendingMomoOrderId() {
  await AsyncStorage.removeItem(STORAGE_KEYS.pendingMomoOrderId);
}

export function resolveMomoOrderIdFromReturnUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  const parsed = Linking.parse(url);
  return resolveMomoOrderId({
    orderId: typeof parsed.queryParams?.orderId === "string" ? parsed.queryParams.orderId : null,
    extraData:
      typeof parsed.queryParams?.extraData === "string" ? parsed.queryParams.extraData : null,
  });
}

export function resolveMomoOrderId(input: {
  orderId?: string | null;
  extraData?: string | null;
}) {
  const queryOrderId = input.orderId ?? null;
  const decodedExtraData = decodeExtraData(input.extraData);

  if (isGuid(decodedExtraData?.orderId)) {
    return decodedExtraData.orderId;
  }

  if (isGuid(queryOrderId)) {
    return queryOrderId;
  }

  return null;
}
