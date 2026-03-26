import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { VoucherCard } from "../../../components/cards/VoucherCard";
import { AppScreen } from "../../../components/common/Primitives";
import { AppHeader } from "../../../components/navigation/AppHeader";
import { api } from "../../../services/mockApi";
import { colors, spacing, typography } from "../../../theme/tokens";

export function VoucherCenterScreen() {
  const navigation = useNavigation<any>();
  const query = useQuery({
    queryKey: ["vouchers"],
    queryFn: api.vouchers.list,
  });

  return (
    <AppScreen backgroundColor={colors.ivory}>
      <AppHeader title="Voucher Của Tôi" onBack={() => navigation.goBack()} />
      <View style={styles.header}>
        <Text style={styles.title}>Kho ưu đãi của bạn</Text>
        <Text style={styles.subtitle}>
          {query.data?.length ?? 0} voucher đang sẵn sàng sử dụng cho đơn hàng tiếp theo.
        </Text>
      </View>
      <View style={styles.list}>
        {(query.data ?? []).map((voucher) => (
          <VoucherCard key={voucher.id} voucher={voucher} />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSoft,
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
});
