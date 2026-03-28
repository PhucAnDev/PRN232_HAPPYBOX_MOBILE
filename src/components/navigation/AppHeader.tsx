import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppStore } from "../../store/useAppStore";
import { colors, radius, spacing } from "../../theme/tokens";

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: React.ComponentProps<typeof MaterialIcons>["name"];
  onPressRight?: () => void;
  showBack?: boolean;
  showNotification?: boolean;
  transparent?: boolean;
}

export function AppHeader({
  title,
  onBack,
  rightIcon,
  onPressRight,
  showBack = true,
  showNotification = false,
  transparent = false,
}: AppHeaderProps) {
  const unreadCount = useAppStore(
    (state) => state.notifications.filter((item) => !item.isRead).length,
  );

  return (
    <View style={[styles.container, !transparent && styles.containerSolid]}>
      {showBack ? (
        <Pressable onPress={onBack} style={styles.iconButton}>
          <MaterialIcons color={colors.text} name="arrow-back-ios-new" size={18} />
        </Pressable>
      ) : (
        <View style={styles.iconSpacer} />
      )}
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      {showNotification ? (
        <Pressable onPress={onPressRight} style={styles.iconButton}>
          <MaterialIcons color={colors.text} name="notifications-none" size={18} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : rightIcon ? (
        <Pressable onPress={onPressRight} style={styles.iconButton}>
          <MaterialIcons color={colors.text} name={rightIcon} size={18} />
        </Pressable>
      ) : (
        <View style={styles.iconSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  containerSolid: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.16,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  iconSpacer: {
    width: 36,
    height: 36,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.white,
  },
});
