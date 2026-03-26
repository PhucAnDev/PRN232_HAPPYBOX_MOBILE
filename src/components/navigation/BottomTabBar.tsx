import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppStore } from "../../store/useAppStore";
import { colors, radius, spacing } from "../../theme/tokens";

const tabMeta: Record<
  string,
  { label: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] }
> = {
  HomeTab: { label: "Trang Chủ", icon: "home-filled" },
  ExploreTab: { label: "Khám Phá", icon: "search" },
  CartTab: { label: "Giỏ Hàng", icon: "shopping-bag" },
  OrdersTab: { label: "Đơn Hàng", icon: "receipt-long" },
  AccountTab: { label: "Tài Khoản", icon: "person-outline" },
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const cartCount = useAppStore((store) => store.getCartCount());

  return (
    <View style={styles.shell}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const meta = tabMeta[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
              testID={descriptors[route.key].options.tabBarButtonTestID}
              onLongPress={onLongPress}
              onPress={onPress}
              style={styles.item}
            >
              <View style={styles.iconWrap}>
                <MaterialIcons
                  color={isFocused ? colors.primary : colors.textMuted}
                  name={meta.icon}
                  size={22}
                />
                {route.name === "CartTab" && cartCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount > 9 ? "9+" : cartCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]}>{meta.label}</Text>
              {isFocused ? <View style={styles.activeDot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: 20,
    shadowColor: "#2C2117",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 4,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 64,
    position: "relative",
  },
  iconWrap: {
    position: "relative",
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "400",
    color: colors.textMuted,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  activeDot: {
    position: "absolute",
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.white,
  },
});
