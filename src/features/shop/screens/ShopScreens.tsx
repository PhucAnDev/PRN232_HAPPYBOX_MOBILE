import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ProductCard } from "../../../components/cards/ProductCard";
import { AppHeader } from "../../../components/navigation/AppHeader";
import { api } from "../../../services/mockApi";
import { useAppStore } from "../../../store/useAppStore";
import { Product } from "../../../types/domain";
import { colors, radius, shadows, spacing } from "../../../theme/tokens";
import { formatPrice } from "../../../utils/format";

const sortOptions = ["Phổ biến", "Giá tăng dần", "Giá giảm dần", "Mới nhất"] as const;

const GIFTBOX_CATEGORY_ID = "giftbox";

type CatalogListItem = Product & {
  kind: "product" | "giftbox";
};

export function ProductListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const addToCart = useAppStore((state) => state.addToCart);
  const [query, setQuery] = useState("");
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("Phổ biến");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeCategory, setActiveCategory] = useState(route.params?.categoryId ?? "all");

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: api.products.list,
  });
  const giftBoxesQuery = useQuery({
    queryKey: ["giftBoxes"],
    queryFn: api.giftBoxes.list,
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: api.products.categories,
  });

  const catalogItems = useMemo<CatalogListItem[]>(() => {
    const products = (productsQuery.data ?? []).map((product) => ({
      ...product,
      kind: "product" as const,
    }));

    const giftBoxes = (giftBoxesQuery.data ?? []).map((giftBox) => ({
      id: giftBox.id,
      name: giftBox.name,
      price: giftBox.price,
      originalPrice: giftBox.originalPrice,
      image: giftBox.image,
      category: "Há»™p quÃ ",
      categoryId: GIFTBOX_CATEGORY_ID,
      rating: 5,
      reviewCount: 0,
      badge: giftBox.tag,
      description: giftBox.description,
      details: giftBox.items,
      isNew: false,
      isBestSeller: giftBox.tag.toLowerCase().includes("best"),
      kind: "giftbox" as const,
    }));

    return [...products, ...giftBoxes];
  }, [giftBoxesQuery.data, productsQuery.data]);

  const filtered = useMemo(() => {
    let list = [...catalogItems];
    if (activeCategory !== "all") {
      list = list.filter((item) => item.categoryId === activeCategory);
    }
    if (query) {
      list = list.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      );
    }
    if (sortBy === "Giá tăng dần") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Giá giảm dần") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Mới nhất") {
      list = list.filter((item) => item.isNew).concat(list.filter((item) => !item.isNew));
    }
    return list;
  }, [activeCategory, catalogItems, query, sortBy]);

  const categories = [
    { id: "all", name: "Tất Cả", icon: "🛍️" },
    { id: GIFTBOX_CATEGORY_ID, name: "Hộp Quà", icon: "🎁", color: colors.primary },
    ...(categoriesQuery.data ?? []),
  ];

  const openCatalogItem = (item: CatalogListItem) => {
    if (item.kind === "giftbox") {
      navigation.navigate("GiftBoxDetail", { giftBoxId: item.id });
      return;
    }

    navigation.navigate("ProductDetail", { productId: item.id });
  };

  const addCatalogItemToCart = (item: CatalogListItem) => {
    addToCart({
      productId: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: 1,
      type: item.kind === "giftbox" ? "giftbox" : "product",
    });
    Toast.show({
      type: "success",
      text1:
        item.kind === "giftbox"
          ? "Đã thêm hộp quà vào giỏ hàng"
          : "Đã thêm vào giỏ hàng",
    });
  };

  return (
    <View style={styles.listRoot}>
      <AppHeader
        title="Khám Phá"
        showBack={false}
        showNotification
        onPressRight={() => navigation.navigate("Notifications")}
      />

      <View style={styles.searchBlock}>
        <View style={styles.searchShell}>
          <MaterialIcons color={colors.textMuted} name="search" size={16} />
          <TextInput
            placeholder="Tìm kiếm sản phẩm, hộp quà..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")}>
              <MaterialIcons color={colors.textMuted} name="close" size={14} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipsRow}>
            {categories.map((category) => {
              const active = activeCategory === category.id;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setActiveCategory(category.id)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  <Text style={styles.categoryChipEmoji}>{category.icon}</Text>
                  <Text style={[styles.categoryChipLabel, active && styles.categoryChipLabelActive]}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.toolbarCount}>{filtered.length} mục</Text>
        <View style={styles.toolbarActions}>
          <View style={styles.sortWrap}>
            <Pressable onPress={() => setShowSort((value) => !value)} style={styles.sortButton}>
              <MaterialIcons color={colors.textSoft} name="tune" size={12} />
              <Text style={styles.sortLabel}>{sortBy}</Text>
              <MaterialIcons color={colors.textSoft} name="expand-more" size={12} />
            </Pressable>
            {showSort ? (
              <View style={styles.sortMenu}>
                {sortOptions.map((option) => {
                  const active = option === sortBy;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setSortBy(option);
                        setShowSort(false);
                      }}
                      style={[styles.sortOption, active && styles.sortOptionActive]}
                    >
                      <Text style={[styles.sortOptionText, active && styles.sortOptionTextActive]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={() => setViewMode((mode) => (mode === "grid" ? "list" : "grid"))}
            style={styles.viewButton}
          >
            <MaterialIcons
              color={colors.textSoft}
              name={viewMode === "grid" ? "view-headline" : "grid-view"}
              size={16}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll} contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm hoặc hộp quà</Text>
            <Text style={styles.emptySubtitle}>Thử tìm kiếm với từ khóa hoặc bộ lọc khác</Text>
            <Pressable
              onPress={() => {
                setQuery("");
                setActiveCategory("all");
              }}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Xóa bộ lọc</Text>
            </Pressable>
          </View>
        ) : viewMode === "grid" ? (
          <View style={styles.grid}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => openCatalogItem(product)}
                onAdd={() => {
                  addCatalogItemToCart(product);
                  return;
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    quantity: 1,
                    type: "product",
                  });
                  Toast.show({ type: "success", text1: "Đã thêm vào giỏ hàng" });
                }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.listStack}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                mode="list"
                product={product}
                onPress={() => openCatalogItem(product)}
                onAdd={() => {
                  addCatalogItemToCart(product);
                  return;
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    quantity: 1,
                    type: "product",
                  });
                  Toast.show({ type: "success", text1: "Đã thêm vào giỏ hàng" });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const addToCart = useAppStore((state) => state.addToCart);
  const wishlist = useAppStore((state) => state.wishlist);
  const toggleWishlist = useAppStore((state) => state.toggleWishlist);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "detail" | "review">("desc");
  const productId = route.params?.productId as string;

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => api.products.detail(productId),
  });
  const relatedQuery = useQuery({
    queryKey: ["products"],
    queryFn: api.products.list,
  });

  const product = productQuery.data;
  const related = (relatedQuery.data ?? [])
    .filter((item) => item.id !== productId)
    .slice(0, 4);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.emptyEmoji}>😕</Text>
        <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const liked = wishlist.includes(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const images = [product.image, product.image, product.image];

  return (
    <View style={styles.detailRoot}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
        <View style={styles.heroShell}>
          <Image source={{ uri: images[activeImage] }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroControls}>
            <Pressable onPress={() => navigation.goBack()} style={styles.heroCircle}>
              <MaterialIcons color={colors.text} name="arrow-back-ios-new" size={18} />
            </Pressable>
            <View style={styles.heroRightControls}>
              <Pressable
                onPress={() => {
                  toggleWishlist(product.id);
                  Toast.show({
                    type: "success",
                    text1: liked ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích",
                  });
                }}
                style={styles.heroCircle}
              >
                <MaterialIcons
                  color={liked ? colors.primary : colors.text}
                  name={liked ? "favorite" : "favorite-border"}
                  size={18}
                />
              </Pressable>
              <Pressable
                onPress={() => Toast.show({ type: "info", text1: "Tính năng đang phát triển" })}
                style={styles.heroCircle}
              >
                <MaterialIcons color={colors.text} name="ios-share" size={18} />
              </Pressable>
            </View>
          </View>
          {product.badge ? <Text style={styles.heroBadge}>{product.badge}</Text> : null}
          <View style={styles.heroDots}>
            {images.map((image, index) => (
              <Pressable
                key={`${image}-${index}`}
                onPress={() => setActiveImage(index)}
                style={[styles.heroDot, index === activeImage ? styles.heroDotActive : styles.heroDotInactive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.detailBody}>
          <View style={styles.detailTopRow}>
            <Text style={styles.detailName}>{product.name}</Text>
            <View style={styles.detailPriceWrap}>
              <Text style={styles.detailPrice}>{formatPrice(product.price)}</Text>
              {product.originalPrice ? (
                <>
                  <Text style={styles.detailOldPrice}>{formatPrice(product.originalPrice)}</Text>
                  <Text style={styles.discountBadge}>-{discount}%</Text>
                </>
              ) : null}
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                  key={star}
                  color={colors.gold}
                  name={star <= Math.floor(product.rating) ? "star" : "star-border"}
                  size={14}
                />
              ))}
              <Text style={styles.ratingValue}>{product.rating}</Text>
            </View>
            <Text style={styles.ratingCount}>({product.reviewCount} đánh giá)</Text>
          </View>

          <View style={styles.quantityCard}>
            <Text style={styles.quantityLabel}>Số lượng</Text>
            <View style={styles.quantityControls}>
              <Pressable
                onPress={() => setQuantity((value) => Math.max(1, value - 1))}
                style={[styles.qtyButton, quantity === 1 && styles.qtyButtonDisabled]}
              >
                <MaterialIcons
                  color={quantity === 1 ? colors.textMuted : colors.white}
                  name="remove"
                  size={14}
                />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable onPress={() => setQuantity((value) => value + 1)} style={styles.qtyButton}>
                <MaterialIcons color={colors.white} name="add" size={14} />
              </Pressable>
            </View>
          </View>

          <View style={styles.tabsShell}>
            {[
              { id: "desc", label: "Mô tả" },
              { id: "detail", label: "Chi tiết" },
              { id: "review", label: "Đánh giá" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as typeof activeTab)}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {activeTab === "desc" ? (
            <Text style={styles.descriptionText}>{product.description}</Text>
          ) : null}

          {activeTab === "detail" ? (
            <View style={styles.detailList}>
              {product.details.map((detail) => (
                <View key={detail} style={styles.detailListRow}>
                  <MaterialIcons color={colors.olive} name="check-circle" size={14} />
                  <Text style={styles.detailListText}>{detail}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {activeTab === "review" ? (
            <View>
              {[
                {
                  name: "Nguyễn Văn A",
                  rating: 5,
                  comment:
                    "Sản phẩm rất tốt, đóng gói đẹp, giao nhanh. Mua làm quà biếu rất ưng ý!",
                },
                {
                  name: "Trần Thị B",
                  rating: 4,
                  comment:
                    "Chất lượng tốt, hương vị thơm ngon. Sẽ tiếp tục ủng hộ shop.",
                },
              ].map((review) => (
                <View key={review.name} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{review.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.reviewName}>{review.name}</Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <MaterialIcons
                            key={star}
                            color={colors.gold}
                            name={star <= review.rating ? "star" : "star-border"}
                            size={10}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {related.length > 0 ? (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Sản phẩm liên quan</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.relatedRow}>
                  {related.map((item) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      onPress={() => navigation.push("ProductDetail", { productId: item.id })}
                      onAdd={() => {
                        addToCart({
                          productId: item.id,
                          name: item.name,
                          image: item.image,
                          price: item.price,
                          quantity: 1,
                          type: "product",
                        });
                        Toast.show({ type: "success", text1: "Đã thêm vào giỏ hàng" });
                      }}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <View style={styles.ctaRow}>
          <Pressable
            onPress={() => {
              addToCart({
                productId: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity,
                type: "product",
              });
              Toast.show({ type: "success", text1: `Đã thêm ${quantity} sản phẩm vào giỏ hàng!` });
            }}
            style={[styles.ctaButton, styles.ctaPrimary]}
          >
            <MaterialIcons color={colors.white} name="shopping-bag" size={16} />
            <Text style={styles.ctaPrimaryText}>Thêm giỏ hàng</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              addToCart({
                productId: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity,
                type: "product",
              });
              navigation.navigate("MainTabs", { screen: "CartTab" });
            }}
            style={[styles.ctaButton, styles.ctaSecondary]}
          >
            <Text style={styles.ctaSecondaryText}>Mua ngay</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBlock: {
    paddingHorizontal: 20,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  chipsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primary,
  },
  categoryChipEmoji: {
    fontSize: 13,
  },
  categoryChipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSoft,
  },
  categoryChipLabelActive: {
    color: colors.white,
  },
  toolbar: {
    paddingHorizontal: 20,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  toolbarCount: {
    fontSize: 12,
    color: colors.textSoft,
  },
  toolbarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  sortWrap: {
    position: "relative",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSoft,
  },
  sortMenu: {
    position: "absolute",
    right: 0,
    top: 36,
    minWidth: 140,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.card,
    ...shadows.lg,
  },
  sortOption: {
    paddingHorizontal: spacing.base,
    paddingVertical: 12,
  },
  sortOptionActive: {
    backgroundColor: colors.background,
  },
  sortOptionText: {
    fontSize: 13,
    color: colors.text,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  viewButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: spacing.base,
    paddingBottom: 120,
  },
  listStack: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    marginTop: spacing.base,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  emptySubtitle: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textSoft,
  },
  emptyButton: {
    marginTop: spacing.base,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  emptyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  detailRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailScroll: {
    paddingBottom: 120,
  },
  heroShell: {
    position: "relative",
    height: 320,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  heroControls: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroRightControls: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  heroCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  heroBadge: {
    position: "absolute",
    top: 48,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
  },
  heroDots: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  heroDot: {
    height: 6,
    borderRadius: 3,
  },
  heroDotActive: {
    width: 16,
    backgroundColor: colors.white,
  },
  heroDotInactive: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  detailBody: {
    marginTop: -16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 25,
  },
  detailPriceWrap: {
    alignItems: "flex-end",
  },
  detailPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },
  detailOldPrice: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  ratingValue: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  quantityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.base,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: spacing.base,
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  qtyButtonDisabled: {
    backgroundColor: colors.border,
  },
  qtyValue: {
    minWidth: 20,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  tabsShell: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: spacing.base,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.card,
    shadowColor: "#2C2117",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSoft,
  },
  tabTextActive: {
    color: colors.primary,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSoft,
    lineHeight: 22,
  },
  detailList: {
    gap: spacing.sm,
  },
  detailListRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  detailListText: {
    fontSize: 13,
    color: colors.text,
  },
  reviewItem: {
    marginBottom: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 1,
  },
  reviewComment: {
    fontSize: 12,
    color: colors.textSoft,
    lineHeight: 18,
  },
  relatedSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  relatedTitle: {
    marginBottom: spacing.md,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  relatedRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: spacing.base,
    paddingBottom: 28,
    shadowColor: "#2C2117",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  ctaButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  ctaPrimary: {
    backgroundColor: colors.primary,
  },
  ctaSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ctaPrimaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  ctaSecondaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
});
