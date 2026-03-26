import "react-native-gesture-handler";
import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { RootNavigator } from "../navigation/RootNavigator";
import { colors } from "../theme/tokens";

export default function App() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
    [],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootNavigator />
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
