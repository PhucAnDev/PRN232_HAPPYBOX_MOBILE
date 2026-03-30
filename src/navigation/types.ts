import { NavigatorScreenParams } from "@react-navigation/native";
import { PaymentMethodId } from "../types/domain";

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: { categoryId?: string } | undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  AccountTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ProductList: { categoryId?: string; fromHomeCategory?: boolean } | undefined;
  ProductDetail: { productId: string };
  GiftBoxList: undefined;
  GiftBoxDetail: { giftBoxId: string };
  GiftBoxBuilder: undefined;
  Checkout: undefined;
  Payment: { paymentMethod: PaymentMethodId; total: number };
  OrderDetail: { orderId?: string | null };
  EditProfile: undefined;
  ChangePassword: undefined;
  AddressList: undefined;
  AddressForm: { addressId?: string } | undefined;
  VoucherCenter: undefined;
  Wishlist: undefined;
  Chatbot: undefined;
  Notifications: undefined;
};
