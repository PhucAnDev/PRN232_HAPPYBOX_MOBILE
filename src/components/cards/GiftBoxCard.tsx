import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { GiftBox } from "../../types/domain";
import { colors, radius, shadows, spacing } from "../../theme/tokens";
import { formatPrice } from "../../utils/format";

interface GiftBoxCardProps {
  giftBox: GiftBox;
  onPress: () => void;
  variant?: "default" | "featured";
}

const tagColors: Record<string, string> = {
  Bestseller: "#8B1A2B",
  Premium: "#C9A84C",
  Wellness: "#4A5D52",
  Romantic: "#B8344A",
};

export function GiftBoxCard({
  giftBox,
  onPress,
  variant = "default",
}: GiftBoxCardProps) {
  if (variant === "featured") {
    return (
      <Pressable onPress={onPress} style={styles.featuredCard}>
        <ImageBackground
          imageStyle={styles.featuredImage}
          source={{ uri: giftBox.image }}
          style={styles.featuredCover}
        >
          <View style={styles.featuredOverlay} />
          <View style={styles.featuredContent}>
            <View style={styles.featuredTopRow}>
              <View style={styles.featuredInfo}>
                <Text style={[styles.featuredTag, { backgroundColor: tagColors[giftBox.tag] ?? colors.primary }]}>
                  {giftBox.tag}
                </Text>
                <Text numberOfLines={2} style={styles.featuredTitle}>
                  {giftBox.name}
                </Text>
                <Text style={styles.featuredMeta}>{giftBox.items.length} sản phẩm</Text>
              </View>
              <View style={styles.featuredPriceWrap}>
                <Text style={styles.featuredPrice}>{formatPrice(giftBox.price)}</Text>
                {giftBox.originalPrice ? (
                  <Text style={styles.featuredOldPrice}>{formatPrice(giftBox.originalPrice)}</Text>
                ) : null}
              </View>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.listCard}>
      <Image source={{ uri: giftBox.image }} style={styles.listImage} />
      <View style={styles.listContent}>
        <Text style={[styles.listTag, { backgroundColor: tagColors[giftBox.tag] ?? colors.primary }]}>
          {giftBox.tag}
        </Text>
        <Text numberOfLines={1} style={styles.listTitle}>
          {giftBox.name}
        </Text>
        <Text numberOfLines={1} style={styles.listDescription}>
          {giftBox.items.slice(0, 2).join(", ")}...
        </Text>
        <View style={styles.listFooter}>
          <View style={styles.listPriceWrap}>
            <Text style={styles.listPrice}>{formatPrice(giftBox.price)}</Text>
            {giftBox.originalPrice ? (
              <Text style={styles.listOldPrice}>{formatPrice(giftBox.originalPrice)}</Text>
            ) : null}
          </View>
          <View style={styles.listArrowWrap}>
            <MaterialIcons color={colors.primary} name="redeem" size={12} />
            <MaterialIcons color={colors.primary} name="chevron-right" size={12} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featuredCard: {
    width: 260,
    flexShrink: 0,
    borderRadius: 16,
    overflow: "hidden",
    ...shadows.md,
  },
  featuredCover: {
    height: 180,
    justifyContent: "flex-end",
  },
  featuredImage: {
    borderRadius: 16,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(44,33,23,0.45)",
  },
  featuredContent: {
    padding: spacing.base,
  },
  featuredTopRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTag: {
    alignSelf: "flex-start",
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
    lineHeight: 18,
  },
  featuredMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  featuredPriceWrap: {
    alignItems: "flex-end",
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.gold,
  },
  featuredOldPrice: {
    marginTop: 2,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    textDecorationLine: "line-through",
  },
  listCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
  listImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
  },
  listContent: {
    flex: 1,
  },
  listTag: {
    alignSelf: "flex-start",
    color: colors.white,
    fontSize: 9,
    fontWeight: "700",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: "hidden",
  },
  listTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  listDescription: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSoft,
  },
  listFooter: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listPriceWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  listOldPrice: {
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  listArrowWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
