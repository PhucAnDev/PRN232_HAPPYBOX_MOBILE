import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storage";

export async function getAccessToken() {
  return AsyncStorage.getItem(STORAGE_KEYS.accessToken);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(STORAGE_KEYS.refreshToken);
}

export async function saveAuthSession(accessToken: string, refreshToken?: string | null) {
  const pairs: Array<[string, string]> = [[STORAGE_KEYS.accessToken, accessToken]];

  if (refreshToken) {
    pairs.push([STORAGE_KEYS.refreshToken, refreshToken]);
  }

  await AsyncStorage.multiSet(pairs);
}

export async function clearAuthSession() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.refreshToken,
    STORAGE_KEYS.user,
  ]);
}
