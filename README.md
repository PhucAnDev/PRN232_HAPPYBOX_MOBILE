# GiftBox Mobile

This repository now runs as an Expo React Native mobile app.

## Start

1. `npm install`
2. `npm run android` or `npm run start`
3. Set API host for mobile:
   - PowerShell: `$env:EXPO_PUBLIC_API_BASE_URL="https://prn232.onrender.com"`
   - Or create `.env` with `EXPO_PUBLIC_API_BASE_URL=...`
   - If you run API locally on Android emulator, use `http://10.0.2.2:<port>`

## Notes

- This project is mobile-only and targets Android/iOS with Expo.
- The app keeps the same ecommerce and gift-box business flow, rebuilt with Expo, React Navigation, React Query, React Hook Form, Zod, and Zustand.
