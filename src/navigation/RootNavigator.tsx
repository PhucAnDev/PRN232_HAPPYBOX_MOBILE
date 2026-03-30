import {
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { BottomTabBar } from "../components/navigation/BottomTabBar";
import { AccountScreen, AddressFormScreen, AddressListScreen, EditProfileScreen, WishlistScreen } from "../features/account/screens/AccountScreens";
import { ChangePasswordScreen } from "../features/account/screens/ChangePasswordScreen";
import { ForgotPasswordScreen, OnboardingScreen, SignInScreen, SignUpScreen, SplashScreen } from "../features/auth/screens/AuthScreens";
import { ChatbotScreen } from "../features/chatbot/screens/ChatbotScreen";
import { CartScreen, CheckoutScreen } from "../features/checkout/screens/CheckoutScreens";
import { GiftBoxBuilderScreen, GiftBoxDetailScreen, GiftBoxListScreen } from "../features/giftbox/screens/GiftBoxScreens";
import { HomeScreen } from "../features/home/screens/HomeScreen";
import { NotificationsScreen } from "../features/notifications/screens/NotificationsScreen";
import { OrderDetailScreen, OrdersScreen } from "../features/orders/screens/OrderScreens";
import { PaymentScreen } from "../features/payment/screens/PaymentScreen";
import { ProductDetailScreen, ProductListScreen } from "../features/shop/screens/ShopScreens";
import { VoucherCenterScreen } from "../features/vouchers/screens/VoucherCenterScreen";
import { colors } from "../theme/tokens";
import { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

const linking = {
  prefixes: ["giftbox://"],
  config: {
    screens: {
      Payment: "payment/momo/result",
    },
  },
};

function AppTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="ExploreTab" component={ProductListScreen} />
      <Tab.Screen name="CartTab" component={CartScreen} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} />
      <Tab.Screen name="AccountTab" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer linking={linking} theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainTabs" component={AppTabs} />
        <Stack.Screen name="ProductList" component={ProductListScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="GiftBoxList" component={GiftBoxListScreen} />
        <Stack.Screen name="GiftBoxDetail" component={GiftBoxDetailScreen} />
        <Stack.Screen name="GiftBoxBuilder" component={GiftBoxBuilderScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="AddressList" component={AddressListScreen} />
        <Stack.Screen name="AddressForm" component={AddressFormScreen} />
        <Stack.Screen name="VoucherCenter" component={VoucherCenterScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
