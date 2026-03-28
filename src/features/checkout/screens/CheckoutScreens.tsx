import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { AddressCard } from "../../../components/cards/AddressCard";
import { VoucherCard } from "../../../components/cards/VoucherCard";
import { AppScreen, EmptyState, SheetModal } from "../../../components/common/Primitives";
import { AppHeader } from "../../../components/navigation/AppHeader";
import { paymentMethods } from "../../../constants/content";
import { api } from "../../../services/mockApi";
import { useAppStore } from "../../../store/useAppStore";
import { CartItem, PaymentMethodId, Voucher } from "../../../types/domain";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";
import { formatPrice } from "../../../utils/format";

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isGuid = (value: string | undefined | null): value is string => {
  if (!value) return false;
  return guidPattern.test(value);
};

const isLocalOnlyCartItem = (item: CartItem) =>
  item.type === "custom" ||
  item.id.startsWith("cart-") ||
  (!item.backendProductId && !item.backendGiftBoxId && !isGuid(item.productId));

const getCartItemSyncKey = (item: CartItem) => {
  if (item.type === "product") {
    return `product:${item.backendProductId ?? item.productId}`;
  }

  if (item.type === "giftbox") {
    return `giftbox:${item.backendGiftBoxId ?? item.productId}`;
  }

  return `custom:${item.id}`;
};

const mergeRemoteCartWithLocalFallback = (remoteItems: CartItem[], localItems: CartItem[]) => {
  if (remoteItems.length === 0) {
    return localItems.filter(isLocalOnlyCartItem);
  }

  const remoteKeys = new Set(remoteItems.map(getCartItemSyncKey));
  const localFallback = localItems.filter(
    (item) => isLocalOnlyCartItem(item) && !remoteKeys.has(getCartItemSyncKey(item)),
  );

  return [...remoteItems, ...localFallback];
};

const isSameCart = (nextItems: CartItem[], currentItems: CartItem[]) => {
  if (nextItems.length !== currentItems.length) return false;
  return nextItems.every((item, index) => {
    const current = currentItems[index];
    if (!current) return false;
    return (
      item.id === current.id &&
      item.quantity === current.quantity &&
      item.price === current.price &&
      item.type === current.type &&
      item.productId === current.productId
    );
  });
};

export function CartScreen() {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const cartItems = useAppStore((state) => state.cartItems);
  const setCartItems = useAppStore((state) => state.setCartItems);
  const appliedVoucher = useAppStore((state) => state.appliedVoucher);
  const updateCartQuantity = useAppStore((state) => state.updateCartQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const applyVoucher = useAppStore((state) => state.applyVoucher);
  const getCartSummary = useAppStore((state) => state.getCartSummary);
  const [showVoucherSheet, setShowVoucherSheet] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [pendingItemIds, setPendingItemIds] = useState<string[]>([]);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: api.cart.get,
    enabled: isAuthenticated,
  });

  const vouchersQuery = useQuery({
    queryKey: ["vouchers"],
    queryFn: api.vouchers.list,
  });

  useEffect(() => {
    if (!cartQuery.data) return;
    const currentItems = useAppStore.getState().cartItems;
    const mergedItems = mergeRemoteCartWithLocalFallback(cartQuery.data, currentItems);
    if (isSameCart(mergedItems, currentItems)) return;
    setCartItems(mergedItems);
  }, [cartQuery.data, setCartItems]);

  const runItemAction = async (itemId: string, action: () => Promise<boolean>) => {
    setPendingItemIds((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    );
    try {
      return await action();
    } finally {
      setPendingItemIds((current) => current.filter((id) => id !== itemId));
    }
  };

  const summary = getCartSummary();

  if (cartItems.length === 0) {
    return (
      <AppScreen backgroundColor={colors.ivory}>
        <AppHeader title="Giỏ Hàng" showBack={false} />
        <EmptyState
          icon="shopping-bag"
          title="Giỏ hàng trống"
          subtitle="Hãy thêm những sản phẩm hoặc hộp quà yêu thích vào giỏ hàng của bạn nhé."
          actionLabel="Khám phá sản phẩm"
          onPressAction={() => navigation.navigate("MainTabs", { screen: "ExploreTab" })}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <AppHeader title={`Giỏ Hàng (${cartItems.length})`} showBack={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cartActionRow}>
          <Pressable
            disabled={isClearingCart}
            onPress={() => {
              if (isClearingCart) return;
              setIsClearingCart(true);
              void clearCart()
                .then((isSuccess) => {
                  Toast.show({
                    type: isSuccess ? "success" : "error",
                    text1: isSuccess
                      ? "Đã xóa toàn bộ giỏ hàng"
                      : "Không thể xóa giỏ hàng. Vui lòng thử lại.",
                  });
                })
                .finally(() => {
                  setIsClearingCart(false);
                });
            }}
          >
            <Text style={styles.clearAllText}>Xóa tất cả</Text>
          </Pressable>
        </View>

        <View style={styles.cartList}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItemCard}>
              <Image source={{ uri: item.image }} style={styles.cartItemImage} />
              <View style={styles.cartItemContent}>
                <Text numberOfLines={2} style={styles.cartItemName}>
                  {item.name}
                </Text>
                {item.type === "custom" ? (
                  <Text style={styles.customBadge}>Custom Gift Box</Text>
                ) : null}
                <View style={styles.cartItemFooter}>
                  <Text style={styles.cartItemPrice}>{formatPrice(item.price)}</Text>
                  <View style={styles.qtyRow}>
                    <Pressable
                      disabled={isClearingCart || pendingItemIds.includes(item.id)}
                      onPress={() => {
                        if (isClearingCart || pendingItemIds.includes(item.id)) return;
                        void runItemAction(item.id, () =>
                          updateCartQuantity(item.id, item.quantity - 1),
                        ).then((isSuccess) => {
                          if (!isSuccess) {
                            Toast.show({
                              type: "error",
                              text1: "Không thể cập nhật số lượng",
                            });
                          }
                        });
                      }}
                      style={styles.qtySecondary}
                    >
                      <MaterialIcons
                        color={item.quantity === 1 ? colors.error : colors.textSoft}
                        name={item.quantity === 1 ? "delete-outline" : "remove"}
                        size={14}
                      />
                    </Pressable>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <Pressable
                      disabled={isClearingCart || pendingItemIds.includes(item.id)}
                      onPress={() => {
                        if (isClearingCart || pendingItemIds.includes(item.id)) return;
                        void runItemAction(item.id, () =>
                          updateCartQuantity(item.id, item.quantity + 1),
                        ).then((isSuccess) => {
                          if (!isSuccess) {
                            Toast.show({
                              type: "error",
                              text1: "Không thể cập nhật số lượng",
                            });
                          }
                        });
                      }}
                      style={styles.qtyPrimary}
                    >
                      <MaterialIcons color={colors.white} name="add" size={14} />
                    </Pressable>
                  </View>
                </View>
              </View>
              <Pressable
                disabled={isClearingCart || pendingItemIds.includes(item.id)}
                onPress={() => {
                  if (isClearingCart || pendingItemIds.includes(item.id)) return;
                  void runItemAction(item.id, () => removeFromCart(item.id)).then((isSuccess) => {
                    if (!isSuccess) {
                      Toast.show({
                        type: "error",
                        text1: "Không thể xóa sản phẩm khỏi giỏ",
                      });
                    }
                  });
                }}
                style={styles.cartRemoveButton}
              >
                <MaterialIcons color={colors.error} name="close" size={14} />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.screenSection}>
          <Pressable
            onPress={() => setShowVoucherSheet(true)}
            style={[
              styles.voucherRow,
              appliedVoucher ? styles.voucherRowActive : undefined,
            ]}
          >
            <View style={styles.voucherLeft}>
              <View style={styles.voucherIconWrap}>
                <MaterialIcons color={colors.primary} name="local-offer" size={16} />
              </View>
              <View>
                {appliedVoucher ? (
                  <>
                    <Text style={styles.voucherCode}>{appliedVoucher.code}</Text>
                    <Text style={styles.voucherHint}>Đã áp dụng voucher</Text>
                  </>
                ) : (
                  <Text style={styles.voucherTitle}>Thêm mã ưu đãi</Text>
                )}
              </View>
            </View>
            <MaterialIcons color={colors.textMuted} name="chevron-right" size={18} />
          </Pressable>
        </View>

        <View style={styles.screenSection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tổng Đơn Hàng</Text>
            <SummaryRow label="Tạm tính" value={formatPrice(summary.subtotal)} />
            {summary.discount > 0 ? (
              <SummaryRow
                label="Giảm giá voucher"
                value={`-${formatPrice(summary.discount)}`}
                color={colors.olive}
              />
            ) : null}
            <SummaryRow
              label="Phí giao hàng"
              value={summary.shipping === 0 ? "Miễn phí" : formatPrice(summary.shipping)}
              color={summary.shipping === 0 ? colors.olive : colors.text}
            />
            {summary.subtotal < 500000 ? (
              <Text style={styles.summaryHint}>
                Thêm {formatPrice(500000 - summary.subtotal)} để được miễn phí giao hàng
              </Text>
            ) : null}
            <SummaryRow label="Tổng cộng" value={formatPrice(summary.total)} strong />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footerShell}>
        <Pressable
          onPress={() => {
            if (!isAuthenticated) {
              Toast.show({
                type: "info",
                text1: "Vui lòng đăng nhập để tiếp tục thanh toán",
              });
              navigation.navigate("SignIn");
              return;
            }
            navigation.navigate("Checkout");
          }}
          style={styles.primaryFooterWrap}
        >
          <LinearGradient
            colors={[colors.primary, colors.gold]}
            style={styles.primaryFooterButton}
          >
            <MaterialIcons color={colors.white} name="shopping-bag" size={18} />
            <Text style={styles.primaryFooterText}>
              Đặt Hàng • {formatPrice(summary.total)}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      <VoucherSheet
        visible={showVoucherSheet}
        vouchers={vouchersQuery.data ?? []}
        selectedVoucherId={appliedVoucher?.id}
        onClose={() => setShowVoucherSheet(false)}
        onSelect={(voucher) => {
          applyVoucher(voucher?.isValid ? voucher : null);
          setShowVoucherSheet(false);
          Toast.show({
            type: voucher?.isValid ? "success" : "error",
            text1: voucher?.isValid ? "Đã áp dụng voucher" : "Voucher không hợp lệ",
          });
        }}
      />
    </AppScreen>
  );
}

function VoucherSheet({
  visible,
  vouchers,
  selectedVoucherId,
  onClose,
  onSelect,
}: {
  visible: boolean;
  vouchers: Voucher[];
  selectedVoucherId?: string;
  onClose: () => void;
  onSelect: (voucher: Voucher | null) => void;
}) {
  return (
    <SheetModal visible={visible} title="Chọn voucher" onClose={onClose}>
      <View style={styles.sheetList}>
        {vouchers.map((voucher) => (
          <VoucherCard
            key={voucher.id}
            voucher={voucher}
            selected={voucher.id === selectedVoucherId}
            onPress={() => onSelect(voucher)}
          />
        ))}
      </View>
    </SheetModal>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  color = colors.text,
}: {
  label: string;
  value: string;
  strong?: boolean;
  color?: string;
}) {
  return (
    <View style={[styles.summaryRow, strong && styles.summaryRowStrong]}>
      <Text style={[styles.summaryLabel, strong && styles.summaryLabelStrong]}>
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          { color },
          strong && styles.summaryValueStrong,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const addresses = useAppStore((state) => state.addresses);
  const cartItems = useAppStore((state) => state.cartItems);
  const setCartItems = useAppStore((state) => state.setCartItems);
  const appliedVoucher = useAppStore((state) => state.appliedVoucher);
  const applyVoucher = useAppStore((state) => state.applyVoucher);
  const getCartSummary = useAppStore((state) => state.getCartSummary);
  const setCheckoutDraft = useAppStore((state) => state.setCheckoutDraft);
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((item) => item.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>("cod");
  const [note, setNote] = useState("");
  const [showVoucherSheet, setShowVoucherSheet] = useState(false);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: api.cart.get,
    enabled: isAuthenticated,
  });

  const vouchersQuery = useQuery({
    queryKey: ["vouchers"],
    queryFn: api.vouchers.list,
  });

  useEffect(() => {
    if (!cartQuery.data) return;
    const currentItems = useAppStore.getState().cartItems;
    const mergedItems = mergeRemoteCartWithLocalFallback(cartQuery.data, currentItems);
    if (isSameCart(mergedItems, currentItems)) return;
    setCartItems(mergedItems);
  }, [cartQuery.data, setCartItems]);

  const summary = getCartSummary();
  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  if (cartItems.length === 0) {
    return (
      <AppScreen backgroundColor={colors.ivory} padded>
        <AppHeader title="Thanh Toán" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="shopping-cart-checkout"
          title="Không có sản phẩm để thanh toán"
          subtitle="Quay lại giỏ hàng và thêm sản phẩm trước khi xác nhận đơn."
          actionLabel="Về giỏ hàng"
          onPressAction={() => navigation.goBack()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <AppHeader title="Thanh Toán" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.screenSection}>
          <Text style={styles.blockTitle}>ĐỊA CHỈ GIAO HÀNG</Text>
          {selectedAddress ? (
            <AddressCard
              address={selectedAddress}
              selected
              onPress={() => undefined}
              onEdit={() => navigation.navigate("AddressList")}
            />
          ) : (
            <Pressable
              onPress={() => navigation.navigate("AddressForm")}
              style={styles.addAddressCard}
            >
              <MaterialIcons color={colors.gold} name="add" size={18} />
              <Text style={styles.addAddressText}>Thêm địa chỉ giao hàng</Text>
            </Pressable>
          )}
          {addresses.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.addressSelectorRow}
            >
              {addresses.map((address) => (
                <Pressable
                  key={address.id}
                  onPress={() => setSelectedAddressId(address.id)}
                  style={[
                    styles.addressChip,
                    selectedAddressId === address.id && styles.addressChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.addressChipText,
                      selectedAddressId === address.id && styles.addressChipTextActive,
                    ]}
                  >
                    {address.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View style={styles.screenSection}>
          <Text style={styles.blockTitle}>TÓM TẮT ĐƠN HÀNG</Text>
          <View style={styles.orderSummaryCard}>
            {cartItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.orderSummaryRow,
                  index < cartItems.length - 1 && styles.orderSummaryDivider,
                ]}
              >
                <Image source={{ uri: item.image }} style={styles.orderSummaryImage} />
                <View style={styles.orderSummaryContent}>
                  <Text numberOfLines={1} style={styles.orderSummaryName}>
                    {item.name}
                  </Text>
                  <Text style={styles.orderSummaryQty}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderSummaryPrice}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.screenSection}>
          <Text style={styles.blockTitle}>PHƯƠNG THỨC THANH TOÁN</Text>
          <View style={styles.paymentList}>
            {paymentMethods.map((method) => {
              const active = selectedPayment === method.id;

              return (
                <Pressable
                  key={method.id}
                  onPress={() => setSelectedPayment(method.id)}
                  style={[styles.paymentCard, active && styles.paymentCardActive]}
                >
                  <View style={styles.paymentCardLeft}>
                    <View style={styles.paymentIconWrap}>
                      <MaterialIcons color={colors.primary} name={method.icon as any} size={18} />
                    </View>
                    <View style={styles.paymentContent}>
                      <Text style={styles.paymentLabel}>{method.label}</Text>
                      <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      active && styles.radioOuterActive,
                    ]}
                  >
                    {active ? <View style={styles.radioInner} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {appliedVoucher ? (
          <View style={styles.screenSection}>
            <View style={styles.appliedVoucherCard}>
              <MaterialIcons color={colors.olive} name="confirmation-number" size={16} />
              <Text style={styles.appliedVoucherText}>
                Voucher {appliedVoucher.code} đã được áp dụng
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.screenSection}>
          <Pressable
            onPress={() => setShowVoucherSheet(true)}
            style={styles.voucherRow}
          >
            <View style={styles.voucherLeft}>
              <View style={styles.voucherIconWrap}>
                <MaterialIcons color={colors.primary} name="local-offer" size={16} />
              </View>
              <View>
                <Text style={styles.voucherTitle}>Chọn voucher</Text>
                <Text style={styles.voucherHint}>
                  {appliedVoucher ? appliedVoucher.code : "Chưa chọn voucher"}
                </Text>
              </View>
            </View>
            <MaterialIcons color={colors.textMuted} name="chevron-right" size={18} />
          </Pressable>
        </View>

        <View style={styles.screenSection}>
          <Text style={styles.blockTitle}>GHI CHÚ</Text>
          <View style={styles.noteCard}>
            <View style={styles.noteRow}>
              <MaterialIcons color={colors.textMuted} name="description" size={16} />
              <TextInput
                multiline
                placeholder="Ghi chú cho đơn hàng (vd: gói quà tặng, giờ giao phù hợp...)"
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
                style={styles.noteInput}
              />
            </View>
          </View>
        </View>

        <View style={styles.screenSection}>
          <View style={styles.summaryCard}>
            <SummaryRow label="Tạm tính" value={formatPrice(summary.subtotal)} />
            {summary.discount > 0 ? (
              <SummaryRow
                label="Giảm giá"
                value={`-${formatPrice(summary.discount)}`}
                color={colors.olive}
              />
            ) : null}
            <SummaryRow
              label="Phí ship"
              value={summary.shipping === 0 ? "Miễn phí" : formatPrice(summary.shipping)}
              color={summary.shipping === 0 ? colors.olive : colors.text}
            />
            <SummaryRow label="Tổng cộng" value={formatPrice(summary.total)} strong />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footerShell}>
        <Pressable
          onPress={() => {
            if (!isAuthenticated) {
              Toast.show({
                type: "info",
                text1: "Vui lòng đăng nhập để đặt hàng",
              });
              navigation.navigate("SignIn");
              return;
            }

            if (!selectedAddressId) {
              Toast.show({
                type: "error",
                text1: "Vui lòng chọn địa chỉ giao hàng",
              });
              return;
            }

            setCheckoutDraft({
              addressId: selectedAddressId,
              paymentMethod: selectedPayment,
              note,
            });
            navigation.navigate("Payment", {
              paymentMethod: selectedPayment,
              total: summary.total,
            });
          }}
          style={styles.primaryFooterWrap}
        >
          <LinearGradient
            colors={[colors.primary, colors.gold]}
            style={styles.primaryFooterButton}
          >
            <Text style={styles.primaryFooterText}>Xác Nhận Đặt Hàng</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <VoucherSheet
        visible={showVoucherSheet}
        vouchers={vouchersQuery.data ?? []}
        selectedVoucherId={appliedVoucher?.id}
        onClose={() => setShowVoucherSheet(false)}
        onSelect={(voucher) => {
          applyVoucher(voucher?.isValid ? voucher : null);
          setShowVoucherSheet(false);
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cartActionRow: {
    paddingHorizontal: 20,
    paddingTop: spacing.base,
    alignItems: "flex-end",
  },
  clearAllText: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.error,
  },
  cartList: {
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  cartItemCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: "row",
    gap: spacing.sm,
    ...shadows.card,
  },
  cartItemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  cartItemContent: {
    flex: 1,
  },
  cartItemName: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
  },
  customBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.successSoft,
    color: colors.olive,
    fontSize: 9,
    fontWeight: "800",
    overflow: "hidden",
  },
  cartItemFooter: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartItemPrice: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.primary,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtySecondary: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyPrimary: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    minWidth: 16,
    textAlign: "center",
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  cartRemoveButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.errorSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  screenSection: {
    paddingHorizontal: 20,
    marginTop: spacing.base,
  },
  voucherRow: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.card,
  },
  voucherRowActive: {
    borderColor: colors.primary,
  },
  voucherLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  voucherIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ivory,
    alignItems: "center",
    justifyContent: "center",
  },
  voucherTitle: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  voucherCode: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.primary,
  },
  voucherHint: {
    marginTop: 2,
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    ...shadows.card,
  },
  summaryTitle: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryRowStrong: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryLabel: {
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  summaryLabelStrong: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  summaryValue: {
    fontSize: typography.caption,
    fontWeight: "700",
  },
  summaryValueStrong: {
    fontSize: typography.h3,
    fontWeight: "900",
    color: colors.primary,
  },
  summaryHint: {
    marginTop: spacing.sm,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    fontSize: typography.tiny,
    color: colors.textSoft,
  },
  bottomSpacer: {
    height: 92,
  },
  footerShell: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: spacing.base,
    paddingBottom: 28,
  },
  primaryFooterWrap: {
    width: "100%",
  },
  primaryFooterButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.primary,
  },
  primaryFooterText: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.white,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  addAddressCard: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.gold,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  addAddressText: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.gold,
  },
  addressSelectorRow: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  addressChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  addressChipText: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.textSoft,
  },
  addressChipTextActive: {
    color: colors.white,
  },
  orderSummaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  orderSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 12,
  },
  orderSummaryDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  orderSummaryImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  orderSummaryContent: {
    flex: 1,
  },
  orderSummaryName: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
  },
  orderSummaryQty: {
    marginTop: 2,
    fontSize: typography.tiny,
    color: colors.textMuted,
  },
  orderSummaryPrice: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.primary,
  },
  paymentList: {
    gap: spacing.sm,
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentCardActive: {
    borderColor: colors.primary,
    ...shadows.primary,
  },
  paymentCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  paymentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentContent: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  paymentSubtitle: {
    marginTop: 2,
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  appliedVoucherCard: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.olive,
    borderRadius: radius.lg,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  appliedVoucherText: {
    flex: 1,
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.olive,
  },
  noteCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: 12,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  noteInput: {
    flex: 1,
    minHeight: 72,
    fontSize: typography.body,
    color: colors.text,
    textAlignVertical: "top",
    paddingVertical: 0,
  },
  sheetList: {
    gap: spacing.base,
    paddingBottom: spacing.base,
  },
});
