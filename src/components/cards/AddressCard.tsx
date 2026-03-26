import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Address } from "../../types/domain";
import { colors, radius, shadows, spacing } from "../../theme/tokens";

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
}

export function AddressCard({
  address,
  selected,
  onPress,
  onEdit,
}: AddressCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected ? styles.cardSelected : styles.cardDefault]}>
      <View style={styles.mainRow}>
        <View style={[styles.pinWrap, selected && styles.pinWrapActive]}>
          <MaterialIcons
            color={selected ? colors.white : colors.primary}
            name="place"
            size={14}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.label}>{address.label}</Text>
            {address.isDefault ? (
              <View style={styles.defaultBadge}>
                <MaterialIcons color={colors.gold} name="star" size={7} />
                <Text style={styles.defaultText}>Mặc định</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.name}>{address.fullName}</Text>
          <Text style={styles.meta}>{address.phone}</Text>
          <Text numberOfLines={2} style={styles.meta}>
            {address.address}, {address.ward}, {address.district}, {address.city}
          </Text>
        </View>
      </View>
      {onEdit ? (
        <View style={styles.actions}>
          <Pressable onPress={onEdit} style={styles.actionButton}>
            <MaterialIcons color={colors.olive} name="edit" size={12} />
            <Text style={[styles.actionText, styles.editText]}>Sửa</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.base,
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
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  pinWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    marginTop: 2,
  },
  pinWrapActive: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: colors.gold,
  },
  defaultText: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.gold,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSoft,
  },
  actions: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  editText: {
    color: colors.olive,
  },
});
