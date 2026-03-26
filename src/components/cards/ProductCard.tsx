import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Product } from "../../types/domain";
import { colors, radius, shadows, spacing } from "../../theme/tokens";
import { formatPrice } from "../../utils/format";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAdd: () => void;
  mode?: "grid" | "list";
}

export function ProductCard({
  product,
  onPress,
  onAdd,
  mode = "grid",
}: ProductCardProps) {
  const isList = mode === "list";

  return (
    <Pressable onPress={onPress} style={[styles.card, isList && styles.cardList]}>
      <View style={[styles.imageWrap, isList && styles.imageWrapList]}>
        <Image source={{ uri: product.image }} style={[styles.image, isList && styles.imageList]} />
        {product.badge ? (
          <Text style={[styles.badge, isList && styles.badgeList]}>{product.badge}</Text>
        ) : null}
      </View>
      <View style={styles.content}>
        <View>
          <Text numberOfLines={2} style={[styles.name, isList && styles.nameList]}>
            {product.name}
          </Text>
          <View style={styles.ratingRow}>
            <MaterialIcons color={colors.gold} name="star" size={10} />
            <Text style={styles.ratingText}>
              {isList ? `${product.rating} (${product.reviewCount})` : product.rating}
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={[styles.price, isList && styles.priceList]}>{formatPrice(product.price)}</Text>
            {product.originalPrice ? (
              <Text style={styles.oldPrice}>{formatPrice(product.originalPrice)}</Text>
            ) : null}
          </View>
          <Pressable hitSlop={8} onPress={onAdd} style={styles.addButton}>
            <MaterialIcons color={colors.white} name="add" size={isList ? 14 : 13} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    flexShrink: 0,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardList: {
    width: "100%",
    flexDirection: "row",
    padding: spacing.md,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 140,
  },
  imageWrapList: {
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: "hidden",
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageList: {
    borderRadius: 12,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
    backgroundColor: colors.primary,
    overflow: "hidden",
  },
  badgeList: {
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 17,
  },
  nameList: {
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 10,
    color: colors.textSoft,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  priceList: {
    fontSize: 14,
  },
  oldPrice: {
    marginTop: 1,
    fontSize: 10,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
});
