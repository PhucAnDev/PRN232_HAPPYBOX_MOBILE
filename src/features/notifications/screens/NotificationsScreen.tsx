import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppScreen, EmptyState } from "../../../components/common/Primitives";
import { AppHeader } from "../../../components/navigation/AppHeader";
import { useAppStore } from "../../../store/useAppStore";
import { AppNotification } from "../../../types/domain";
import { colors, radius, spacing, typography } from "../../../theme/tokens";
import { formatShortDate } from "../../../utils/format";

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const notifications = useAppStore((state) => state.notifications);
  const orders = useAppStore((state) => state.orders);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const onPressNotification = (item: AppNotification) => {
    markNotificationRead(item.id);

    if (item.kind !== "order") {
      return;
    }

    if (item.orderId && orders.some((order) => order.id === item.orderId)) {
      navigation.navigate("OrderDetail", { orderId: item.orderId });
      return;
    }

    navigation.navigate("MainTabs", { screen: "OrdersTab" });
  };

  if (notifications.length === 0) {
    return (
      <AppScreen backgroundColor={colors.ivory} padded>
        <AppHeader title="Thông Báo" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="notifications-off"
          title="Chưa có thông báo"
          subtitle="Ưu đãi, cập nhật đơn hàng và cảnh báo voucher sẽ xuất hiện tại đây."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor={colors.ivory}>
      <AppHeader title="Thông Báo" onBack={() => navigation.goBack()} />
      <View style={styles.list}>
        {sortedNotifications.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.card, !item.isRead && styles.cardUnread]}
            onPress={() => onPressNotification(item)}
          >
            <View style={styles.iconWrap}>
              <MaterialIcons
                color={colors.primary}
                name={
                  item.kind === "order"
                    ? "local-shipping"
                    : item.kind === "voucher"
                      ? "local-offer"
                      : item.kind === "promo"
                        ? "celebration"
                        : "info-outline"
                }
                size={20}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>{formatShortDate(item.createdAt)}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  card: {
    flexDirection: "row",
    gap: spacing.base,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.base,
  },
  cardUnread: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  body: {
    color: colors.textSoft,
    fontSize: typography.caption,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  date: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    marginTop: spacing.sm,
  },
});
