import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { GiftBoxCard } from "../../../components/cards/GiftBoxCard";
import { ProductCard } from "../../../components/cards/ProductCard";
import { api } from "../../../services/mockApi";
import { useAppStore } from "../../../store/useAppStore";
import { colors, radius, shadows, spacing } from "../../../theme/tokens";
import { IMAGES } from "../../../mocks/data";

const banners = [
  { id: "banner-1", image: IMAGES.hero, title: "Quà Tết 2025\nSang Trọng", sub: "Ưu đãi đến 30%", cta: "Khám Phá" },
  { id: "banner-2", image: IMAGES.giftBox, title: "Gift Box\nCao Cấp", sub: "Từ 850.000đ", cta: "Xem Ngay" },
  { id: "banner-3", image: IMAGES.ribbon, title: "Giỏ Quà\nTuyển Chọn", sub: "Giao tận nơi", cta: "Đặt Hàng" },
];

const exploreThemes = [
  { emoji: "🎊", title: "Quà Tết 2025", sub: "24 sản phẩm", bg: "#8B1A2B" },
  { emoji: "💝", title: "Quà Sinh Nhật", sub: "18 sản phẩm", bg: "#C9A84C" },
  { emoji: "🏢", title: "Quà Doanh Nghiệp", sub: "12 sản phẩm", bg: "#4A5D52" },
  { emoji: "💍", title: "Quà Cưới Hỏi", sub: "8 sản phẩm", bg: "#8B6914" },
];

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const user = useAppStore((state) => state.user);
  const wishlist = useAppStore((state) => state.wishlist);
  const addToCart = useAppStore((state) => state.addToCart);
  const [activeBanner, setActiveBanner] = useState(0);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: api.products.list,
  });
  const giftBoxesQuery = useQuery({
    queryKey: ["giftBoxes"],
    queryFn: api.giftBoxes.list,
  });
  const vouchersQuery = useQuery({
    queryKey: ["vouchers"],
    queryFn: api.vouchers.list,
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: api.products.categories,
  });

  const products = productsQuery.data ?? [];
  const giftBoxes = giftBoxesQuery.data ?? [];
  const vouchers = vouchersQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const featuredProducts = useMemo(
    () => products.filter((item) => item.isBestSeller || item.isNew).slice(0, 5),
    [products],
  );

  const handleBannerMomentumEnd = (offsetX: number) => {
    const next = Math.round(offsetX / width);
    setActiveBanner(next);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.root}
      contentContainerStyle={styles.content}
    >
      <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Xin chào</Text>
            <Text style={styles.name}>{user?.fullName?.split(" ").slice(-1)[0] || "Bạn"}!</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              badge={wishlist.length}
              icon="favorite-border"
              onPress={() => navigation.navigate("Wishlist")}
              highlightBadge
            />
            <IconButton
              badge={1}
              icon="notifications-none"
              onPress={() => navigation.navigate("Notifications")}
            />
            <IconButton icon="chat-bubble-outline" onPress={() => navigation.navigate("Chatbot")} />
          </View>
        </View>

        <Pressable onPress={() => navigation.navigate("ExploreTab")} style={styles.searchButton}>
          <MaterialIcons color="rgba(255,255,255,0.7)" name="search" size={16} />
          <Text style={styles.searchText}>Tìm kiếm sản phẩm...</Text>
        </Pressable>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          handleBannerMomentumEnd(event.nativeEvent.contentOffset.x)
        }
      >
        {banners.map((banner) => (
          <View key={banner.id} style={{ width, height: 180 }}>
            <Image source={{ uri: banner.image }} style={styles.bannerImage} />
            <LinearGradient
              colors={["rgba(44,33,23,0.82)", "rgba(44,33,23,0.2)"]}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 0 }}
              style={styles.bannerOverlay}
            >
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSub}>{banner.sub}</Text>
                <Pressable onPress={() => navigation.navigate("ExploreTab")} style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>{banner.cta}</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {banners.map((banner, index) => (
          <View
            key={banner.id}
            style={[styles.dot, index === activeBanner ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader
          actionLabel="Tất cả"
          onPressAction={() => navigation.navigate("ExploreTab")}
          title="Danh Mục"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() =>
                navigation.navigate("ProductList", {
                  categoryId: category.id,
                  fromHomeCategory: true,
                })
              }
              style={styles.categoryItem}
            >
              <View
                style={[
                  styles.categoryIconShell,
                  { backgroundColor: `${category.color}15`, borderColor: `${category.color}25` },
                ]}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryLabel}>{category.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Pressable onPress={() => navigation.navigate("VoucherCenter")} style={styles.voucherOuter}>
          <LinearGradient colors={["#8B6914", colors.gold]} style={styles.voucherBanner}>
            <View style={styles.voucherIconWrap}>
              <MaterialIcons color={colors.white} name="percent" size={20} />
            </View>
            <View style={styles.voucherTextWrap}>
              <Text style={styles.voucherTitle}>Voucher ưu đãi dành riêng cho bạn!</Text>
              <Text style={styles.voucherSubtitle}>
                {vouchers.filter((item) => item.isValid).length} voucher đang chờ bạn sử dụng
              </Text>
            </View>
            <MaterialIcons color={colors.white} name="chevron-right" size={16} />
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.sectionNoPadding}>
        <SectionHeader
          actionLabel="Xem tất cả"
          onPressAction={() => navigation.navigate("ExploreTab")}
          title="Sản Phẩm Nổi Bật"
          withPadding
        />
        <ScrollView horizontal contentContainerStyle={styles.horizontalContent} showsHorizontalScrollIndicator={false}>
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() =>
                navigation.navigate("ProductDetail", {
                  productId: product.id,
                })
              }
              onAdd={() => {
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
        </ScrollView>
      </View>

      <View style={styles.sectionNoPadding}>
        <SectionHeader
          actionLabel="Xem tất cả"
          onPressAction={() => navigation.navigate("GiftBoxList")}
          title="Hộp Quà Cao Cấp"
          withPadding
        />
        <ScrollView horizontal contentContainerStyle={styles.horizontalContent} showsHorizontalScrollIndicator={false}>
          {giftBoxes.map((giftBox) => (
            <GiftBoxCard
              key={giftBox.id}
              giftBox={giftBox}
              onPress={() =>
                navigation.navigate("GiftBoxDetail", {
                  giftBoxId: giftBox.id,
                })
              }
              variant="featured"
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.themeTitle}>Khám Phá Theo Chủ Đề</Text>
        <View style={styles.themeGrid}>
          {exploreThemes.map((theme) => (
            <Pressable key={theme.title} onPress={() => navigation.navigate("ExploreTab")} style={[styles.themeCard, { backgroundColor: theme.bg }]}>
              <Text style={styles.themeEmoji}>{theme.emoji}</Text>
              <Text style={styles.themeCardTitle}>{theme.title}</Text>
              <Text style={styles.themeCardSub}>{theme.sub}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tất Cả Sản Phẩm</Text>
        <View style={styles.listStack}>
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              mode="list"
              product={product}
              onPress={() =>
                navigation.navigate("ProductDetail", {
                  productId: product.id,
                })
              }
              onAdd={() => {
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
        <Pressable onPress={() => navigation.navigate("ExploreTab")} style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Xem tất cả sản phẩm →</Text>
        </Pressable>
      </View>

      <View style={[styles.section, styles.supportSection]}>
        <Pressable onPress={() => navigation.navigate("Chatbot")} style={styles.supportCard}>
          <LinearGradient colors={[colors.primary, colors.gold]} style={styles.supportIcon}>
            <MaterialIcons color={colors.white} name="chat-bubble-outline" size={22} />
          </LinearGradient>
          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>Cần tư vấn quà tặng?</Text>
            <Text style={styles.supportSubtitle}>Chat với trợ lý AI của chúng tôi ngay!</Text>
          </View>
          <MaterialIcons color={colors.textMuted} name="chevron-right" size={16} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function IconButton({
  icon,
  badge,
  onPress,
  highlightBadge = false,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  badge?: number;
  onPress: () => void;
  highlightBadge?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.headerIconButton}>
      <MaterialIcons
        color={highlightBadge && badge ? colors.gold : colors.white}
        name={icon}
        size={18}
      />
      {badge ? (
        <View style={[styles.headerBadge, highlightBadge ? styles.headerBadgeGold : styles.headerBadgeDot]}>
          {highlightBadge ? <Text style={styles.headerBadgeText}>{badge > 9 ? "9+" : badge}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onPressAction,
  withPadding,
}: {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  withPadding?: boolean;
}) {
  return (
    <View style={[styles.sectionHeader, withPadding && styles.sectionHeaderPadded]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onPressAction ? (
        <Pressable onPress={onPressAction} style={styles.actionRow}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <MaterialIcons color={colors.primary} name="chevron-right" size={13} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.base,
  },
  hello: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  name: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeGold: {
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    paddingHorizontal: 3,
    backgroundColor: colors.gold,
  },
  headerBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.gold,
    top: 4,
    right: 4,
  },
  headerBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.text,
  },
  searchButton: {
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
  bannerContent: {
    paddingHorizontal: 20,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    lineHeight: 25,
  },
  bannerSub: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  bannerButton: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.gold,
  },
  bannerButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: colors.borderDark,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: spacing.xl,
  },
  sectionNoPadding: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.base,
  },
  sectionHeaderPadded: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: spacing.md,
  },
  categoryIconShell: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    marginTop: spacing.sm,
    width: 56,
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSoft,
    textAlign: "center",
  },
  voucherOuter: {
    borderRadius: 16,
    overflow: "hidden",
  },
  voucherBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    padding: spacing.base,
    ...shadows.gold,
  },
  voucherIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  voucherTextWrap: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  voucherSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
  horizontalContent: {
    paddingHorizontal: 20,
    gap: spacing.md,
  },
  themeTitle: {
    marginBottom: spacing.base,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  themeCard: {
    width: "47.5%",
    borderRadius: 16,
    padding: spacing.base,
    ...shadows.md,
  },
  themeEmoji: {
    fontSize: 28,
  },
  themeCardTitle: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  themeCardSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  listStack: {
    gap: spacing.md,
  },
  outlineButton: {
    marginTop: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  supportSection: {
    marginBottom: spacing.sm,
  },
  supportCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  supportCopy: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  supportSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSoft,
  },
});
