# GiftBox Mobile

This repository now runs as an Expo React Native mobile app.

## Start

1. `npm install`
2. `npm run android` or `npm run start`

## Shared API With `PRN232_HAPPYBOX_FE`

`FE mobile` now has the same API setup pattern as the web project:

- `src/constants/env.ts`: API base URL and mock toggle
- `src/services/http.ts`: axios client with bearer token + refresh token interceptor
- `src/services/authService.ts`, `productService.ts`, `giftBoxService.ts`, `voucherService.ts`, `categoryService.ts`, `chatbotService.ts`, `paymentService.ts`: backend services mirrored from `PRN232_HAPPYBOX_FE`
- `src/services/mockApi.ts`: adapter layer used by the mobile screens; it now calls the real backend by default and only falls back to mock data when `EXPO_PUBLIC_USE_MOCK_API=true`
- `src/services/cartService.ts`, `src/services/orderService.ts`, `src/services/userService.ts`: shared cart, order, and user API services
- `src/services/backendData.ts`: mobile-side data enrichment for user profile, addresses, and order history screens
- `src/services/paymentSession.ts`: deep-link return helpers for MoMo on mobile

Create a local `.env` file from `.env.example` before running:

```bash
cp .env.example .env
```

Recommended values:

```env
EXPO_PUBLIC_API_URL=https://prn232.onrender.com/api
EXPO_PUBLIC_USE_MOCK_API=false
```

If you run the backend locally:

- Physical Android phone: use your LAN IP, for example `http://192.168.1.10:5000/api`
- Android emulator: use `http://10.0.2.2:5000/api`
- Do not use `http://localhost:5000/api` on a real phone, because `localhost` will point to the phone itself

## Current Backend Coverage

When `EXPO_PUBLIC_USE_MOCK_API=false`, `FE mobile` now uses the shared backend for:

- auth
- product list and product detail
- category list
- gift box list and detail
- vouchers
- chatbot
- cart sync for normal product/gift box items
- checkout for COD, bank transfer, and MoMo WebBrowser flow
- user profile read
- order history read

Still local or partial for now:

- custom gift box checkout remains local
- address create/edit/delete is still local because the current shared API does not expose a dedicated address CRUD flow
- VNPay mobile payment flow is not yet integrated

MoMo mobile flow is now wired through `expo-web-browser` and app deep links:

- create order via `/Payment/momo/create-order`
- open returned `payUrl` with `openAuthSessionAsync`
- if a deep-link callback is available, receive it at `payment/momo-return`
- otherwise keep the pending order id locally and verify `/Payment/momo/orders/:id/status` when the user returns from the browser
- fetch the created order and upsert it into mobile state

## Notes

- This project is mobile-only and targets Android/iOS with Expo.
- The app keeps the same ecommerce and gift-box business flow, rebuilt with Expo, React Navigation, React Query, React Hook Form, Zod, and Zustand.
- The app config defines `scheme: "giftboxmobile"` for native builds. In Expo Go, `expo-linking` still generates a working dev URL, but payment return flows are generally more stable in a development build or release build than in Expo Go.
- Without backend support for a mobile-specific MoMo redirect URL, the smoothest FE-only fallback is: complete payment in the browser, close the browser, then let the app verify the pending order when it regains control.
