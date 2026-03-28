import { AuthTokens } from "../types/domain";

let currentTokens: AuthTokens | null = null;
const listeners = new Set<(tokens: AuthTokens | null) => void>();

export const session = {
  getTokens: () => currentTokens,
  setTokens: (tokens: AuthTokens | null) => {
    currentTokens = tokens;
    listeners.forEach((listener) => listener(tokens));
  },
  subscribe: (listener: (tokens: AuthTokens | null) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
