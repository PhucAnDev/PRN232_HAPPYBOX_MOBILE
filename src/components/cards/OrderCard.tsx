import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Order } from "../../types/domain";
import { colors, radius, shadows, spacing } from "../../theme/tokens";
import { formatPrice, formatShortDate, getStatusLabel, getStatusTone } from "../../utils/format";

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const firstItem = order.items[0];
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const tone = getStatusTone(order.status);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.orderMeta}>
          <Text style={styles.orderMetaLabel}>Mã đơn:</Text>
          <Text style={styles.orderMetaValue}>{order.orderNumber || "--"}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={[styles.statusPill, { color: tone, backgroundColor: `${tone}18` }]}>
            {getStatusLabel(order.status)}
          </Text>
          <MaterialIcons color={colors.textMuted} name="chevron-right" size={14} />
        </View>
      </View>
      <View style={styles.previewRow}>
        <Image source={{ uri: firstItem?.image }} style={styles.image} />
        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.name}>
            {firstItem?.name}
          </Text>
          {order.items.length > 1 ? (
            <Text style={styles.secondary}>+{order.items.length - 1} sản phẩm khác</Text>
          ) : null}
          <Text style={styles.secondary}>Số lượng: {totalItems}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.date}>{formatShortDate(order.createdAt)}</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng:</Text>
          <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    ...shadows.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orderMetaLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  orderMetaValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    fontSize: 11,
    fontWeight: "600",
    overflow: "hidden",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  secondary: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSoft,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  date: {
    fontSize: 11,
    color: colors.textMuted,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textSoft,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
});
