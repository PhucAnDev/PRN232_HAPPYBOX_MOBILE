import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppScreen } from "../../../components/common/Primitives";
import { useAppStore } from "../../../store/useAppStore";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";
import { formatPrice } from "../../../utils/format";

type PaymentState = "processing" | "success" | "failed";

const paymentLabels: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng",
  bank: "Chuyển khoản ngân hàng",
  momo: "Ví MoMo",
  vnpay: "VNPay",
};

export function PaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const placeOrder = useAppStore((state) => state.placeOrder);
  const [state, setState] = useState<PaymentState>("processing");
  const [orderId, setOrderId] = useState("");

  const paymentMethod = route.params?.paymentMethod ?? "cod";
  const total = route.params?.total ?? 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      const success = Math.random() < 0.88;

      if (success) {
        const order = placeOrder();
        setOrderId(order?.id ?? "");
        setState("success");
      } else {
        setState("failed");
      }
    }, 2400);

    return () => clearTimeout(timer);
  }, [placeOrder]);

  const tone = useMemo(() => {
    if (state === "success") {
      return {
        colors: ["#1B4332", "#2D6A4F"] as const,
        icon: "check-circle",
        title: "Đặt hàng thành công! 🎉",
        subtitle: "Cảm ơn bạn đã tin tưởng GiftBox. Đơn hàng của bạn đang được xử lý.",
      };
    }

    if (state === "failed") {
      return {
        colors: ["#7F1D1D", colors.error] as const,
        icon: "cancel",
        title: "Thanh toán thất bại",
        subtitle: "Giao dịch không thành công. Vui lòng kiểm tra lại và thử lại.",
      };
    }

    return {
      colors: [colors.primaryDark, colors.primary] as const,
      icon: "payments",
      title: "Đang xử lý thanh toán",
      subtitle: paymentLabels[paymentMethod] || "Đang kết nối cổng thanh toán...",
    };
  }, [paymentMethod, state]);

  if (state === "processing") {
    return (
      <LinearGradient colors={tone.colors} style={styles.processingRoot}>
        <View style={styles.processingCircle}>
          <Text style={styles.processingEmoji}>💳</Text>
        </View>
        <Text style={styles.processingTitle}>{tone.title}</Text>
        <Text style={styles.processingSubtitle}>{tone.subtitle}</Text>
        <View style={styles.processingAmount}>
          <Text style={styles.processingAmountText}>{formatPrice(total)}</Text>
        </View>

        <View style={styles.processingSteps}>
          {[
            "Kết nối cổng thanh toán...",
            "Xác thực giao dịch...",
            "Đang xử lý...",
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

        {state === "success" ? (
          <View style={styles.body}>
            <View style={styles.summaryCard}>
              <InfoRow label="Mã đơn hàng" value={orderId || "—"} highlight />
              <InfoRow label="Phương thức" value={paymentLabels[paymentMethod] || "—"} />
              <InfoRow label="Tổng thanh toán" value={formatPrice(total)} highlight />
              <InfoRow label="Thời gian giao hàng dự kiến" value="2-3 ngày làm việc" />
            </View>

            <View style={styles.centerMessage}>
              <Text style={styles.centerEmoji}>🎁</Text>
              <Text style={styles.centerText}>
                Chúng tôi sẽ thông báo khi đơn hàng được xác nhận và giao hàng.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.body, styles.failedBody]}>
            <Text style={styles.centerEmoji}>😕</Text>
            <Text style={styles.centerText}>
              Có lỗi xảy ra trong quá trình thanh toán. Số tiền chưa bị trừ.
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          {state === "success" ? (
            <>
              <PrimaryButton
                label="Theo Dõi Đơn Hàng"
                onPress={() =>
                  navigation.reset({
                    index: 1,
                    routes: [
                      { name: "MainTabs", params: { screen: "OrdersTab" } },
                      { name: "OrderDetail", params: { orderId } },
                    ],
                  })
                }
              />
              <SecondaryButton
                label="Về Trang Chủ"
                onPress={() => navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] })}
              />
            </>
          ) : (
            <>
              <PrimaryButton
                label="Thử Lại"
                onPress={() => navigation.replace("Payment", { paymentMethod, total })}
                icon="refresh"
              />
              <SecondaryButton
                label="Về Trang Chủ"
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
