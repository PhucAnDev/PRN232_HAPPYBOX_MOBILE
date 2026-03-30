import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { OrderCard } from "../../../components/cards/OrderCard";
import { AppScreen, EmptyState } from "../../../components/common/Primitives";
import { AppHeader } from "../../../components/navigation/AppHeader";
import { api } from "../../../services/mockApi";
import { useAppStore } from "../../../store/useAppStore";
import { OrderStatus } from "../../../types/domain";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";
import { formatPrice, getStatusLabel, getStatusTone } from "../../../utils/format";

const statusTabs: Array<{ key: OrderStatus | "all"; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

export function OrdersScreen() {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const orders = useAppStore((state) => state.orders);
  const setOrders = useAppStore((state) => state.setOrders);
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const emptySyncRetryRef = useRef(0);

  const ordersQuery = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => api.orders.listByUser(user?.id || ""),
    enabled: Boolean(isAuthenticated && user?.id),
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!ordersQuery.data) return;

    if (ordersQuery.data.length === 0 && orders.length > 0) {
      if (emptySyncRetryRef.current < 1) {
        emptySyncRetryRef.current += 1;
        const retryTimeout = setTimeout(() => {
          void ordersQuery.refetch();
        }, 1200);

        return () => {
          clearTimeout(retryTimeout);
        };
      }

      return;
    }

    emptySyncRetryRef.current = 0;
    setOrders(ordersQuery.data);
  }, [orders.length, ordersQuery.data, ordersQuery.refetch, setOrders]);

  const filtered = useMemo(
    () => orders.filter((order) => (activeTab === "all" ? true : order.status === activeTab)),
    [activeTab, orders],
  );

  if (!isAuthenticated) {
    return (
      <AppScreen backgroundColor={colors.ivory}>
        <AppHeader title="Đơn Hàng" showBack={false} />
        <EmptyState
          icon="inventory-2"
          title="Bạn chưa đăng nhập"
          subtitle="Đăng nhập để theo dõi trạng thái đơn hàng theo thời gian thực."
          actionLabel="Đăng nhập ngay"
          onPressAction={() => navigation.navigate("SignIn")}
        />
      </AppScreen>
    );
  }

  if (ordersQuery.isLoading && orders.length === 0) {
    return (
      <AppScreen backgroundColor={colors.ivory} padded>
        <AppHeader title="Đơn Hàng" showBack={false} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>⌛</Text>
          <Text style={styles.emptyTitle}>Đang tải đơn hàng</Text>
          <Text style={styles.emptyText}>Vui lòng chờ trong giây lát...</Text>
        </View>
      </AppScreen>
    );
  }

  if (orders.length === 0) {
    return (
      <AppScreen backgroundColor={colors.ivory}>
        <AppHeader title="Đơn Hàng" showBack={false} />
        <EmptyState
          icon="inventory-2"
          title="Chưa có đơn hàng"
          subtitle="Các đơn hàng của bạn sẽ hiển thị tại đây sau khi mua sắm."
          actionLabel="Mua ngay"
          onPressAction={() => navigation.navigate("MainTabs", { screen: "ExploreTab" })}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <AppHeader title="Đơn Hàng" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={ordersQuery.isFetching}
            onRefresh={() => {
              emptySyncRetryRef.current = 0;
              void ordersQuery.refetch();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          style={styles.tabsShell}
        >
          {statusTabs.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabChip, active && styles.tabChipActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.orderList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>Chưa có đơn hàng phù hợp</Text>
              <Text style={styles.emptyText}>Hãy thử chọn trạng thái khác để xem lịch sử đơn hàng.</Text>
            </View>
          ) : (
            filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}
export function OrderDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAppStore((state) => state.user);
  const orders = useAppStore((state) => state.orders);
  const setOrders = useAppStore((state) => state.setOrders);
  const orderId = route.params?.orderId as string | undefined;

  const fallbackOrder = orders.find((item) => item.id === orderId) ?? null;

  const detailQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.orders.detail(orderId || ""),
    enabled: Boolean(orderId),
  });

  const order = detailQuery.data ?? fallbackOrder;
  const isCancellable = order?.status === "pending" || order?.status === "confirmed";

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!order?.id) {
        throw new Error("Không tìm thấy mã đơn hàng hợp lệ.");
      }

      await api.orders.cancel(order.id);

      if (user?.id) {
        const latestOrders = await api.orders.listByUser(user.id);
        setOrders(latestOrders);
      }
    },
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Đã gửi yêu cầu hủy đơn" });
      void detailQuery.refetch();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Không thể hủy đơn hàng",
        text2: api.errors.getMessage(error, "Vui lòng thử lại sau."),
      });
    },
  });

  if (!order) {
    return (
      <AppScreen backgroundColor={colors.ivory} padded>
        <AppHeader title="Chi Tiết Đơn Hàng" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="receipt-long"
          title="Không tìm thấy đơn hàng"
          subtitle="Đơn hàng này hiện không còn tồn tại hoặc đã bị xóa."
          actionLabel="Quay lại"
          onPressAction={() => navigation.goBack()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <View style={styles.detailHeader}>
        <View style={styles.detailHeaderRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons color={colors.text} name="arrow-back-ios-new" size={18} />
          </Pressable>
          <View>
            <Text style={styles.detailHeaderTitle}>Chi Tiết Đơn Hàng</Text>
            <Text style={styles.detailHeaderMeta}>{order.orderNumber || "--"}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusTone(order.status)}18` },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: getStatusTone(order.status) }]}>
            {getStatusLabel(order.status)}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.detailContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={detailQuery.isFetching}
            onRefresh={() => {
              void detailQuery.refetch();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Trạng thái đơn hàng</Text>
          {order.timeline.map((step, index) => (
            <View key={`${step.status}-${index}`} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View
                  style={[
                    styles.timelineCircle,
                    step.done ? styles.timelineCircleDone : styles.timelineCirclePending,
                  ]}
                >
                  {step.done ? (
                    <MaterialIcons color={colors.white} name="check" size={10} />
                  ) : null}
                </View>
                {index < order.timeline.length - 1 ? (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: step.done ? colors.primary : colors.border },
                    ]}
                  />
                ) : null}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    !step.done && styles.timelineTitlePending,
                  ]}
                >
                  {step.status}
                </Text>
                <Text style={styles.timelineTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.detailCard}>
          <View style={styles.cardHeadingRow}>
            <MaterialIcons color={colors.primary} name="place" size={14} />
            <Text style={styles.cardTitle}>Địa chỉ giao hàng</Text>
          </View>
          <Text style={styles.addressName}>
            {order.address.fullName} — {order.address.phone}
          </Text>
          <Text style={styles.addressText}>
            {order.address.address}, {order.address.ward}, {order.address.district}, {order.address.city}
          </Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Sản phẩm</Text>
          {order.items.map((item, index) => (
            <View
              key={`${item.productId}-${index}`}
              style={[
                styles.itemRow,
                index < order.items.length - 1 && styles.itemDivider,
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemContent}>
                <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
          <SummaryRow label="Tạm tính" value={formatPrice(order.subtotal)} />
          {order.discount > 0 ? (
            <SummaryRow label="Giảm giá" value={`-${formatPrice(order.discount)}`} color={colors.olive} />
          ) : null}
          <SummaryRow
            label="Phí ship"
            value={order.shipping === 0 ? "Miễn phí" : formatPrice(order.shipping)}
            color={order.shipping === 0 ? colors.olive : colors.text}
          />
          <SummaryRow label="Tổng cộng" value={formatPrice(order.total)} strong />
          <View style={styles.paymentMethodRow}>
            <MaterialIcons color={colors.textSoft} name="local-shipping" size={14} />
            <Text style={styles.paymentMethodText}>Phương thức: {String(order.paymentMethod).toUpperCase()}</Text>
          </View>
        </View>

        {isCancellable ? (
          <Pressable
            style={[styles.cancelButton, cancelMutation.isPending && styles.cancelButtonDisabled]}
            onPress={() => {
              Alert.alert(
                "Xác nhận hủy đơn",
                "Bạn có chắc muốn hủy đơn hàng này không?",
                [
                  { text: "Không", style: "cancel" },
                  {
                    text: "Hủy đơn",
                    style: "destructive",
                    onPress: () => cancelMutation.mutate(),
                  },
                ],
              );
            }}
            disabled={cancelMutation.isPending}
          >
            <Text style={styles.cancelText}>
              {cancelMutation.isPending ? "Đang xử lý..." : "Hủy Đơn Hàng"}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </AppScreen>
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
      <Text style={[styles.summaryLabel, strong && styles.summaryLabelStrong]}>{label}</Text>
      <Text style={[styles.summaryValue, { color }, strong && styles.summaryValueStrong]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsShell: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  tabChip: {
    minHeight: 34,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primary,
  },
  tabText: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.textSoft,
  },
  tabTextActive: {
    color: colors.white,
  },
  orderList: {
    paddingHorizontal: 20,
    paddingTop: spacing.base,
    gap: spacing.base,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    marginTop: spacing.base,
    fontSize: typography.h3,
    fontWeight: "800",
    color: colors.text,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: typography.caption,
    color: colors.textSoft,
    textAlign: "center",
  },
  detailHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  detailHeaderTitle: {
    fontSize: typography.h3,
    fontWeight: "800",
    color: colors.text,
  },
  detailHeaderMeta: {
    marginTop: 2,
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontSize: typography.caption,
    fontWeight: "800",
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingBottom: spacing.xxxl,
    gap: spacing.base,
  },
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.base,
  },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  timelineRail: {
    alignItems: "center",
  },
  timelineCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineCircleDone: {
    backgroundColor: colors.primary,
  },
  timelineCirclePending: {
    borderWidth: 2,
    borderColor: colors.borderDark,
    backgroundColor: colors.white,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.base,
  },
  timelineTitle: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  timelineTitlePending: {
    color: colors.textMuted,
    fontWeight: "500",
  },
  timelineTime: {
    marginTop: 2,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  cardHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.base,
  },
  addressName: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  addressText: {
    marginTop: 4,
    fontSize: typography.caption,
    lineHeight: 18,
    color: colors.textSoft,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
  },
  itemQty: {
    marginTop: 2,
    fontSize: typography.tiny,
    color: colors.textMuted,
  },
  itemPrice: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.primary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
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
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  paymentMethodText: {
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  cancelButton: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.base,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelText: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.error,
  },
});
