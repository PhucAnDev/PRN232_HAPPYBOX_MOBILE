import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Voucher } from "../../types/domain";
import { colors, radius, shadows, spacing } from "../../theme/tokens";

interface VoucherCardProps {
  voucher: Voucher;
  selected?: boolean;
  onPress?: () => void;
}

export function VoucherCard({ voucher, selected, onPress }: VoucherCardProps) {
  const discountLabel =
    voucher.discountType === "percent"
      ? `Giảm ${voucher.discountValue}%`
      : `Giảm ${(voucher.discountValue / 1000).toFixed(0)}K`;

  const minOrderText = new Intl.NumberFormat("vi-VN").format(voucher.minOrder) + "đ";

  return (
    <Pressable
      disabled={!voucher.isValid}
      onPress={onPress}
      style={[
        styles.card,
        selected ? styles.cardSelected : styles.cardDefault,
        !voucher.isValid && styles.cardDisabled,
      ]}
    >
      <View style={[styles.leftStrip, !voucher.isValid && styles.leftStripDisabled]}>
        <MaterialIcons color={colors.white} name="sell" size={18} />
        <Text style={styles.leftStripText}>{discountLabel}</Text>
      </View>

      <View style={styles.separator}>
        <View style={styles.cutoutTop} />
        <View style={styles.dash} />
        <View style={styles.cutoutBottom} />
      </View>

      <View style={styles.content}>
        <View style={styles.contentTop}>
          <View style={styles.contentMain}>
            <Text style={styles.title}>{voucher.title}</Text>
            <Text numberOfLines={2} style={styles.description}>
              {voucher.description}
            </Text>
            <Text style={styles.minOrder}>Đơn tối thiểu: {minOrderText}</Text>
          </View>
          {selected ? (
            <View style={styles.selectedBadge}>
              <MaterialIcons color={colors.white} name="check" size={12} />
            </View>
          ) : null}
        </View>
        <View style={styles.footer}>
          <Text style={styles.code}>{voucher.code}</Text>
          <View style={styles.expiryRow}>
            <MaterialIcons color={colors.textMuted} name="schedule" size={10} />
            <Text style={styles.expiry}>{voucher.expiry}</Text>
          </View>
        </View>
      </View>

      {!voucher.isValid ? (
        <View style={styles.expiredPill}>
          <Text style={styles.expiredText}>Hết hạn</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    flexDirection: "row",
  },
  cardDefault: {
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.primary,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  leftStrip: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.primary,
  },
  leftStripDisabled: {
    backgroundColor: colors.textMuted,
  },
  leftStripText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
  },
  separator: {
    width: 1,
    position: "relative",
    backgroundColor: colors.border,
  },
  dash: {
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  cutoutTop: {
    position: "absolute",
    top: -8,
    left: -8,
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 1,
  },
  cutoutBottom: {
    position: "absolute",
    bottom: -8,
    left: -8,
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
  },
  contentTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  contentMain: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  description: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSoft,
    lineHeight: 16,
  },
  minOrder: {
    marginTop: 4,
    fontSize: 10,
    color: colors.textMuted,
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  code: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    borderStyle: "dashed",
    backgroundColor: colors.background,
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  expiry: {
    fontSize: 9,
    color: colors.textMuted,
  },
  expiredPill: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.textMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  expiredText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.white,
  },
});
