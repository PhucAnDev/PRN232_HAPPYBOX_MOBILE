import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppScreen } from "../../../components/common/Primitives";
import { fetchOrderByBackendId } from "../../../services/backendData";
import {
  clearPendingMomoOrderId,
  getPendingMomoOrderId,
  resolveMomoOrderId,
  resolveMomoOrderIdFromReturnUrl,
} from "../../../services/paymentSession";
import paymentService from "../../../services/paymentService";
import { useAppStore } from "../../../store/useAppStore";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";
import { formatPrice } from "../../../utils/format";

type ReturnState = "processing" | "success" | "failed";

export function PaymentReturnScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAppStore((state) => state.user);
  const clearCart = useAppStore((state) => state.clearCart);
  const setCheckoutDraft = useAppStore((state) => state.setCheckoutDraft);
  const upsertOrder = useAppStore((state) => state.upsertOrder);
  const [state, setState] = useState<ReturnState>("processing");
  const [orderId, setOrderId] = useState(route.params?.orderId ?? "");
  const [amount, setAmount] = useState<number>(route.params?.total ?? 0);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingMessage, setProcessingMessage] = useState(
    "Dang xac minh ket qua thanh toan MoMo...",
  );

  useEffect(() => {
    let active = true;

    const verifyPayment = async () => {
      const storedOrderId = await getPendingMomoOrderId();
      const resolvedOrderId =
        resolveMomoOrderIdFromReturnUrl(route.params?.returnUrl) ??
        resolveMomoOrderId({
          orderId: typeof route.params?.orderId === "string" ? route.params.orderId : null,
          extraData: typeof route.params?.extraData === "string" ? route.params.extraData : null,
        }) ??
        storedOrderId;

      if (!resolvedOrderId) {
        if (active) {
          setErrorMessage("Khong xac dinh duoc don hang MoMo de doi soat.");
          setState("failed");
        }
        await clearPendingMomoOrderId();
        return;
      }

      if (active) {
        setOrderId(resolvedOrderId);
        setProcessingMessage("Dang doi soat trang thai giao dich voi MoMo...");
      }

      try {
        const paymentStatus = await paymentService.confirmMomoPayment(resolvedOrderId);

        if (!active) {
          return;
        }

        setAmount(paymentStatus.amount || route.params?.total || 0);

        if (
          paymentStatus.resultCode === 0 ||
          paymentStatus.localPaymentStatus === "Success"
        ) {
          setProcessingMessage("Dang dong bo don hang ve app...");

          try {
            const resolvedOrder = await fetchOrderByBackendId(resolvedOrderId, user);

            if (!active) {
              return;
            }

            upsertOrder(resolvedOrder);
            setOrderId(resolvedOrder.id);
            setAmount(resolvedOrder.total);
          } catch {
            // Keep success state even if the snapshot fetch lags behind.
          }

          clearCart();
          setCheckoutDraft(null);
          setState("success");
        } else {
          setErrorMessage(
            paymentStatus.message ||
              "Giao dich MoMo chua thanh cong. Vui long kiem tra lai don hang.",
          );
          setState("failed");
        }
      } catch (error) {
        if (active) {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (error as Error)?.message ||
            "Khong the xac minh trang thai thanh toan MoMo.";
          setErrorMessage(message);
          setState("failed");
        }
      } finally {
        await clearPendingMomoOrderId();
      }
    };

    void verifyPayment();

    return () => {
      active = false;
    };
  }, [clearCart, route.params, setCheckoutDraft, upsertOrder, user]);

  const tone = useMemo(() => {
    if (state === "success") {
      return {
        colors: ["#1B4332", "#2D6A4F"] as const,
        icon: "check-circle",
        title: "Thanh toan MoMo thanh cong!",
        subtitle: "Don hang cua ban da duoc xac nhan va dong bo ve app.",
      };
    }

    if (state === "failed") {
      return {
        colors: ["#7F1D1D", colors.error] as const,
        icon: "cancel",
        title: "Khong xac minh duoc giao dich",
        subtitle:
          errorMessage ||
          "Khong the hoan tat doi soat thanh toan. Vui long kiem tra lai don hang.",
      };
    }

    return {
      colors: [colors.primaryDark, colors.primary] as const,
      icon: "sync",
      title: "Dang xac minh thanh toan",
      subtitle: processingMessage,
    };
  }, [errorMessage, processingMessage, state]);

  const openOrder = () => {
    navigation.reset({
      index: 1,
      routes: [
        { name: "MainTabs", params: { screen: "OrdersTab" } },
        { name: "OrderDetail", params: { orderId } },
      ],
    });
  };

  if (state === "processing") {
    return (
      <LinearGradient colors={tone.colors} style={styles.processingRoot}>
        <View style={styles.processingCircle}>
          <MaterialIcons color={colors.white} name="sync" size={40} />
        </View>
        <Text style={styles.processingTitle}>{tone.title}</Text>
        <Text style={styles.processingSubtitle}>{tone.subtitle}</Text>
        {amount > 0 ? (
          <View style={styles.processingAmount}>
            <Text style={styles.processingAmountText}>{formatPrice(amount)}</Text>
          </View>
        ) : null}
        <View style={styles.processingSteps}>
          {[
            "Nhan callback tu cong thanh toan...",
            "Doi soat trang thai giao dich...",
            "Dong bo don hang ve app...",
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

        <View style={styles.body}>
          <View style={styles.summaryCard}>
            <InfoRow label="Ma don hang" value={orderId || "--"} highlight />
            <InfoRow label="Phuong thuc" value="Vi MoMo" />
            <InfoRow
              label="Tong thanh toan"
              value={amount > 0 ? formatPrice(amount) : "--"}
              highlight
            />
          </View>

          <View style={styles.centerMessage}>
            <Text style={styles.centerEmoji}>{state === "success" ? "🎁" : "😕"}</Text>
            <Text style={styles.centerText}>
              {state === "success"
                ? "Ban co the mo chi tiet don hang de theo doi trang thai xu ly va giao hang."
                : "Neu ban da thanh toan nhung app chua dong bo kip, hay vao Don hang de kiem tra lai."}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          {state === "success" || orderId ? (
            <PrimaryButton label="Xem Don Hang" onPress={openOrder} />
          ) : (
            <PrimaryButton
              label="Ve Gio Hang"
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainTabs", params: { screen: "CartTab" } }],
                })
              }
            />
          )}
          <SecondaryButton
            label="Ve Trang Chu"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] })}
          />
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
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.primaryWrap}>
      <LinearGradient colors={[colors.primary, colors.gold]} style={styles.primaryButton}>
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
