import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { AppScreen } from "../../../components/common/Primitives";
import { api } from "../../../services/mockApi";
import { useAppStore } from "../../../store/useAppStore";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";
import { formatPrice } from "../../../utils/format";

type PaymentState = "processing" | "success" | "pending" | "failed";

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isGuid = (value: string | undefined | null): value is string => {
  if (!value) return false;
  return guidPattern.test(value);
};

const paymentLabels: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng",
  bank: "Chuyển khoản ngân hàng",
  momo: "Ví MoMo",
  vnpay: "VNPay",
};

export function PaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAppStore((state) => state.user);
  const addresses = useAppStore((state) => state.addresses);
  const cartItems = useAppStore((state) => state.cartItems);
  const appliedVoucher = useAppStore((state) => state.appliedVoucher);
  const checkoutDraft = useAppStore((state) => state.checkoutDraft);
  const setOrders = useAppStore((state) => state.setOrders);
  const setCartItems = useAppStore((state) => state.setCartItems);
  const setCheckoutDraft = useAppStore((state) => state.setCheckoutDraft);
  const applyVoucher = useAppStore((state) => state.applyVoucher);
  const addNotification = useAppStore((state) => state.addNotification);

  const [state, setState] = useState<PaymentState>("processing");
  const [orderId, setOrderId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [gatewayStatus, setGatewayStatus] = useState("");
  const [canOpenOrderDetail, setCanOpenOrderDetail] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  const paymentMethod = route.params?.paymentMethod ?? checkoutDraft?.paymentMethod ?? "cod";
  const total = route.params?.total ?? 0;

  useEffect(() => {
    if (hasProcessed) return;
    setHasProcessed(true);

    let cancelled = false;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const processPayment = async () => {
      if (!user?.id || !checkoutDraft || cartItems.length === 0) {
        setState("failed");
        setErrorMessage("Không tìm thấy thông tin đơn hàng để thanh toán.");
        return;
      }

      const selectedAddress =
        addresses.find((item) => item.id === checkoutDraft.addressId) ??
        addresses.find((item) => item.isDefault) ??
        null;

      if (!selectedAddress) {
        setState("failed");
        setErrorMessage("Vui lòng chọn địa chỉ giao hàng.");
        return;
      }

      const shippingAddress = [
        selectedAddress.address,
        selectedAddress.ward,
        selectedAddress.district,
        selectedAddress.city,
      ]
        .filter(Boolean)
        .join(", ");

      let payload = api.checkout.createOrderPayload({
        userId: user.id,
        paymentMethod,
        voucherId: appliedVoucher?.id,
        shippingAddress,
        shippingPhone: selectedAddress.phone || user.phone || "",
        note: checkoutDraft.note || "",
        cartItems,
      });

      if (payload.orderDetails.length === 0) {
        try {
          const remoteCartItems = await api.cart.get();
          if (remoteCartItems.length > 0) {
            setCartItems(remoteCartItems);
            payload = api.checkout.createOrderPayload({
              userId: user.id,
              paymentMethod,
              voucherId: appliedVoucher?.id,
              shippingAddress,
              shippingPhone: selectedAddress.phone || user.phone || "",
              note: checkoutDraft.note || "",
              cartItems: remoteCartItems,
            });
          }
        } catch {
          // Keep the original payload and fail gracefully below.
        }
      }

      if (payload.orderDetails.length === 0) {
        setState("failed");
        setErrorMessage("Giỏ hàng chưa đồng bộ với server. Vui lòng quay lại giỏ hàng và thử lại.");
        setCanOpenOrderDetail(false);
        return;
      }

      try {
        let createdOrderId = "";
        let latestGatewayStatus = "";
        let paymentResult: Extract<PaymentState, "success" | "pending"> = "success";
        let orderSnapshot: Awaited<ReturnType<typeof api.orders.detail>> = null;

        if (paymentMethod === "momo") {
          const momoResponse = await api.payment.createOrderAndMomoPayment(payload);
          createdOrderId = momoResponse.orderId;

          if (!createdOrderId) {
            throw new Error("Không nhận được mã đơn hàng từ cổng thanh toán MoMo.");
          }

          if (!momoResponse.payUrl) {
            throw new Error("Không nhận được liên kết thanh toán MoMo. Vui lòng thử lại.");
          }

          const canOpenMomo = await Linking.canOpenURL(momoResponse.payUrl).catch(() => false);
          if (!canOpenMomo) {
            throw new Error("Không thể mở ứng dụng/đường dẫn thanh toán MoMo.");
          }
          await Linking.openURL(momoResponse.payUrl);

          latestGatewayStatus =
            momoResponse.localPaymentStatus || momoResponse.message || "";

          try {
            const statusResponse = await api.payment.getMomoOrderStatus(createdOrderId);
            latestGatewayStatus =
              statusResponse.localPaymentStatus || statusResponse.message || "";

            const normalizedStatus =
              `${statusResponse.localPaymentStatus} ${statusResponse.message}`.toLowerCase();
            const isFailed =
              normalizedStatus.includes("fail") ||
              normalizedStatus.includes("cancel") ||
              normalizedStatus.includes("that bai") ||
              normalizedStatus.includes("huy");
            const isPaid =
              statusResponse.resultCode === 0 ||
              normalizedStatus.includes("success") ||
              normalizedStatus.includes("paid") ||
              normalizedStatus.includes("thanh cong");

            if (isFailed) {
              throw new Error(
                statusResponse.message || "Thanh toán MoMo không thành công.",
              );
            }

            if (!isPaid) {
              paymentResult = "pending";
            }
          } catch (statusError) {
            if (statusError instanceof Error) {
              const message = statusError.message.toLowerCase();
              if (
                message.includes("fail") ||
                message.includes("cancel") ||
                message.includes("that bai") ||
                message.includes("huy")
              ) {
                throw statusError;
              }
            }
            paymentResult = "pending";
          }

          for (let retry = 0; retry < 3; retry += 1) {
            orderSnapshot = await api.orders.detail(createdOrderId);
            if (orderSnapshot) break;
            await wait(1200);
          }
        } else {
          const createdOrder = await api.orders.create(payload);
          createdOrderId = createdOrder.id;
          orderSnapshot = createdOrder;
        }

        try {
          await api.cart.clear();
        } catch {
          // Keep flow successful even if cart-clear API fails.
        }

        let latestOrders = await api.orders.listByUser(user.id);
        if (latestOrders.length === 0 && createdOrderId) {
          await wait(1200);
          latestOrders = await api.orders.listByUser(user.id);
        }

        if (!orderSnapshot && createdOrderId) {
          orderSnapshot = await api.orders.detail(createdOrderId);
        }
        const mergedOrders = latestOrders.length > 0
          ? latestOrders
          : orderSnapshot
            ? [orderSnapshot]
            : [];

        if (cancelled) return;

        setOrderId(createdOrderId);
        setGatewayStatus(latestGatewayStatus);
        setOrders(mergedOrders);
        setCanOpenOrderDetail(
          Boolean(
            createdOrderId &&
              isGuid(createdOrderId) &&
              mergedOrders.some((order) => order.id === createdOrderId),
          ),
        );
        setCartItems([]);
        setCheckoutDraft(null);
        applyVoucher(null);

        const finalStatus = orderSnapshot?.status ?? (paymentResult === "success" ? "confirmed" : "pending");
        addNotification({
          title:
            paymentResult === "success"
              ? "Đặt hàng thành công"
              : "Đơn hàng đang chờ xác nhận thanh toán",
          body:
            paymentResult === "success"
              ? `Đơn ${createdOrderId} đã được tạo. Bạn có thể theo dõi chi tiết trong mục Đơn hàng.`
              : `Đơn ${createdOrderId} đã tạo, vui lòng kiểm tra trạng thái thanh toán MoMo.`,
          kind: "order",
          orderId: createdOrderId || undefined,
          orderStatus: finalStatus,
        });
        setState(paymentResult);
      } catch (error) {
        if (cancelled) return;
        setState("failed");
        setCanOpenOrderDetail(false);
        const message = api.errors.getMessage(error, "Thanh toán thất bại. Vui lòng thử lại.");
        setErrorMessage(message);
        addNotification({
          title: "Thanh toán chưa hoàn tất",
          body: message,
          kind: "info",
        });
      }
    };

    void processPayment();

    return () => {
      cancelled = true;
    };
  }, [
    addresses,
    appliedVoucher,
    applyVoucher,
    cartItems,
    checkoutDraft,
    paymentMethod,
    addNotification,
    setCartItems,
    setCheckoutDraft,
    setOrders,
    user?.id,
    user?.phone,
    hasProcessed,
  ]);

  const tone = useMemo(() => {
    if (state === "success") {
      return {
        colors: ["#1B4332", "#2D6A4F"] as const,
        icon: "check-circle",
        title: "Đặt hàng thành công",
        subtitle: "Đơn hàng của bạn đã được tạo thành công.",
      };
    }

    if (state === "pending") {
      return {
        colors: ["#6B4F1D", "#B8860B"] as const,
        icon: "hourglass-top",
        title: "Đơn hàng đang chờ xác nhận thanh toán",
        subtitle: "Đơn đã tạo, vui lòng hoàn tất hoặc kiểm tra trạng thái trên MoMo.",
      };
    }

    if (state === "failed") {
      return {
        colors: ["#7F1D1D", colors.error] as const,
        icon: "cancel",
        title: "Thanh toán thất bại",
        subtitle: errorMessage || "Giao dịch không thành công. Vui lòng thử lại.",
      };
    }

    return {
      colors: [colors.primaryDark, colors.primary] as const,
      icon: "payments",
      title: "Đang xử lý thanh toán",
      subtitle: paymentLabels[paymentMethod] || "Đang kết nối cổng thanh toán...",
    };
  }, [errorMessage, paymentMethod, state]);

  if (state === "processing") {
    return (
      <LinearGradient colors={tone.colors} style={styles.processingRoot}>
        <View style={styles.processingCircle}>
          <Text style={styles.processingEmoji}>ðŸ’³</Text>
        </View>
        <Text style={styles.processingTitle}>{tone.title}</Text>
        <Text style={styles.processingSubtitle}>{tone.subtitle}</Text>
        <View style={styles.processingAmount}>
          <Text style={styles.processingAmountText}>{formatPrice(total)}</Text>
        </View>

        <View style={styles.processingSteps}>
          {[
            "Kết nối cổng thanh toán...",
            "Tạo đơn hàng...",
            "Đồng bộ trạng thái...",
          ].map((item) => (
            <View key={item} style={styles.processingRow}>
              <View style={styles.processingDot} />
              <Text style={styles.processingText}>{item}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    );
  }

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <View style={styles.flex}>
        <LinearGradient colors={tone.colors} style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <MaterialIcons color={colors.white} name={tone.icon as any} size={48} />
          </View>
          <Text style={styles.bannerTitle}>{tone.title}</Text>
          <Text style={styles.bannerSubtitle}>{tone.subtitle}</Text>
        </LinearGradient>

        {state === "success" || state === "pending" ? (
          <View style={styles.body}>
            <View style={styles.summaryCard}>
              <InfoRow label="Mã đơn hàng" value={orderId || "--"} highlight />
              <InfoRow label="Phương thức" value={paymentLabels[paymentMethod] || "--"} />
              {gatewayStatus ? (
                <InfoRow label="Trạng thái cổng thanh toán" value={gatewayStatus} />
              ) : null}
              <InfoRow label="Tổng thanh toán" value={formatPrice(total)} highlight />
              <InfoRow label="Thời gian giao dự kiến" value="2-3 ngày làm việc" />
            </View>

            <View style={styles.centerMessage}>
              <Text style={styles.centerEmoji}>ðŸŽ</Text>
              <Text style={styles.centerText}>
                Chúng tôi sẽ thông báo khi đơn hàng được xác nhận và giao hàng.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.body, styles.failedBody]}>
            <Text style={styles.centerEmoji}>ðŸ˜•</Text>
            <Text style={styles.centerText}>{tone.subtitle}</Text>
          </View>
        )}

        <View style={styles.footer}>
          {state === "success" || state === "pending" ? (
            <>
              <PrimaryButton
                label="Theo dõi đơn hàng"
                onPress={() => {
                  if (canOpenOrderDetail && isGuid(orderId)) {
                    navigation.reset({
                      index: 1,
                      routes: [
                        { name: "MainTabs", params: { screen: "OrdersTab" } },
                        { name: "OrderDetail", params: { orderId } },
                      ],
                    });
                    return;
                  }

                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MainTabs", params: { screen: "OrdersTab" } }],
                  });
                }}
              />
              <SecondaryButton
                label="Về trang chủ"
                onPress={() => navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] })}
              />
            </>
          ) : (
            <>
              <PrimaryButton
                label="Thử lại"
                onPress={() => {
                  Toast.show({
                    type: "info",
                    text1: "Đang thử lại thanh toán",
                  });
                  navigation.replace("Payment", { paymentMethod, total });
                }}
                icon="refresh"
              />
              <SecondaryButton
                label="Về trang chủ"
                onPress={() => navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] })}
              />
            </>
          )}
        </View>
      </View>
    </AppScreen>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
}) {
  return (
    <Pressable onPress={onPress} style={styles.primaryWrap}>
      <LinearGradient colors={[colors.primary, colors.gold]} style={styles.primaryButton}>
        {icon ? <MaterialIcons color={colors.white} name={icon} size={18} /> : null}
        <Text style={styles.primaryText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  processingRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  processingCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  processingEmoji: {
    fontSize: 40,
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
    textAlign: "center",
  },
  processingSubtitle: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
  },
  processingAmount: {
    marginTop: spacing.base,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  processingAmountText: {
    fontSize: typography.body,
    fontWeight: "900",
    color: colors.gold,
  },
  processingSteps: {
    marginTop: spacing.xxxl,
    width: "100%",
    gap: spacing.sm,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  processingText: {
    fontSize: typography.caption,
    color: "rgba(255,255,255,0.78)",
  },
  banner: {
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  bannerIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
    textAlign: "center",
  },
  bannerSubtitle: {
    marginTop: 6,
    fontSize: typography.caption,
    lineHeight: 18,
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  failedBody: {
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    ...shadows.card,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  infoLabel: {
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  infoValue: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
  },
  infoValueHighlight: {
    color: colors.primary,
    fontWeight: "900",
  },
  centerMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxl,
  },
  centerEmoji: {
    fontSize: 64,
  },
  centerText: {
    marginTop: spacing.base,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textSoft,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: spacing.base,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  primaryWrap: {
    width: "100%",
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.primary,
  },
  primaryText: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.white,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.textSoft,
  },
});


