import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GiftBoxCard } from "../../../components/cards/GiftBoxCard";
import { AppScreen, EmptyState } from "../../../components/common/Primitives";
import { AppHeader } from "../../../components/navigation/AppHeader";
import { boxTypes } from "../../../constants/content";
import { api } from "../../../services/mockApi";
import { useAppStore } from "../../../store/useAppStore";
import { BoxTypeOption, GiftBox, Product } from "../../../types/domain";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";
import { formatPrice } from "../../../utils/format";

const tagColors: Record<string, string> = {
  Bestseller: colors.primary,
  Premium: colors.gold,
  Wellness: colors.olive,
  Romantic: colors.primaryLight,
};

const quickBuildCards = [
  { emoji: "💼", title: "Quà Doanh Nghiệp", desc: "Từ 2 triệu", bg: colors.primary },
  { emoji: "💝", title: "Quà Ý Nghĩa", desc: "Từ 500K", bg: colors.olive },
];

const guarantees = [
  { emoji: "🎀", title: "Gói quà sang trọng", desc: "Theo yêu cầu riêng" },
  { emoji: "🚚", title: "Giao toàn quốc", desc: "Đảm bảo an toàn" },
  { emoji: "✨", title: "Chất lượng cao cấp", desc: "Tuyển chọn kỹ lưỡng" },
  { emoji: "🔄", title: "Đổi trả 7 ngày", desc: "Nếu có vấn đề" },
];

const reviews = [
  {
    name: "Nguyễn Minh Thư",
    comment: "Hộp quà đẹp lắm, đóng gói cẩn thận và giao đúng hẹn. Người nhận rất thích.",
    time: "3 ngày trước",
  },
  {
    name: "Trần Đức Anh",
    comment: "Mua làm quà biếu Tết rất xịn. Sẽ tiếp tục ủng hộ GiftBox cho những dịp sau.",
    time: "1 tuần trước",
  },
];

export function GiftBoxListScreen() {
  const navigation = useNavigation<any>();
  const query = useQuery({
    queryKey: ["giftBoxes"],
    queryFn: api.giftBoxes.list,
  });

  const items = query.data ?? [];

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <AppHeader
        title="Hộp Quà Cao Cấp"
        onBack={() => navigation.goBack()}
        showNotification
        onPressRight={() => navigation.navigate("Notifications")}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.primaryDark, colors.primary, colors.gold]}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroEmoji}>🎁</Text>
            <Text style={styles.heroTitle}>Tạo Gift Box{"\n"}Của Riêng Bạn</Text>
            <Text style={styles.heroText}>Cá nhân hóa từng chi tiết</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("GiftBoxBuilder")}
            style={styles.heroButton}
          >
            <MaterialIcons color={colors.primary} name="auto-awesome" size={14} />
            <Text style={styles.heroButtonText}>Tạo Ngay</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.quickRow}>
          {quickBuildCards.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => navigation.navigate("GiftBoxBuilder")}
              style={[styles.quickCard, { backgroundColor: item.bg }]}
            >
              <Text style={styles.quickEmoji}>{item.emoji}</Text>
              <Text style={styles.quickTitle}>{item.title}</Text>
              <Text style={styles.quickDesc}>{item.desc}</Text>
              <View style={styles.quickActionRow}>
                <Text style={styles.quickActionText}>Tạo ngay</Text>
                <MaterialIcons color="rgba(255,255,255,0.9)" name="chevron-right" size={12} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Hộp Quà Có Sẵn</Text>
          <Text style={styles.sectionMeta}>{items.length} hộp quà</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        >
          {items.slice(0, 3).map((giftBox) => (
            <GiftBoxCard
              key={giftBox.id}
              giftBox={giftBox}
              variant="featured"
              onPress={() =>
                navigation.navigate("GiftBoxDetail", { giftBoxId: giftBox.id })
              }
            />
          ))}
        </ScrollView>

        <View style={styles.listWrap}>
          {items.map((giftBox) => (
            <GiftBoxListItem
              key={giftBox.id}
              giftBox={giftBox}
              onPress={() =>
                navigation.navigate("GiftBoxDetail", { giftBoxId: giftBox.id })
              }
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

export function GiftBoxDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const addToCart = useAppStore((state) => state.addToCart);
  const wishlist = useAppStore((state) => state.wishlist);
  const toggleWishlist = useAppStore((state) => state.toggleWishlist);
  const giftBoxId = route.params?.giftBoxId as string;
  const [quantity, setQuantity] = useState(1);
  const [showAllItems, setShowAllItems] = useState(false);

  const query = useQuery({
    queryKey: ["giftBox", giftBoxId],
    queryFn: () => api.giftBoxes.detail(giftBoxId),
  });

  const giftBox = query.data;

  if (query.isLoading && !giftBox) {
    return (
      <AppScreen backgroundColor={colors.ivory} padded>
        <AppHeader title="Hộp Quà" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="hourglass-empty"
          title="Vui lòng chờ trong giây lát"
          subtitle=""
        />
      </AppScreen>
    );
  }

  if (!giftBox) {
    return (
      <AppScreen backgroundColor={colors.ivory} padded>
        <AppHeader title="Hộp Quà" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="redeem"
          title="Không tìm thấy hộp quà"
          subtitle="Mẫu hộp quà này hiện không còn trong dữ liệu tham chiếu."
          actionLabel="Quay lại"
          onPressAction={() => navigation.goBack()}
        />
      </AppScreen>
    );
  }

  const isLiked = wishlist.includes(giftBox.id);
  const discount = giftBox.originalPrice
    ? Math.round(((giftBox.originalPrice - giftBox.price) / giftBox.originalPrice) * 100)
    : 0;
  const visibleItems = showAllItems ? giftBox.items : giftBox.items.slice(0, 4);

  const addCurrentBox = () => {
    addToCart({
      productId: giftBox.id,
      name: giftBox.name,
      image: giftBox.image,
      price: giftBox.price,
      quantity,
      type: "giftbox",
    });
    Toast.show({
      type: "success",
      text1: `Đã thêm ${quantity} hộp quà vào giỏ hàng`,
    });
  };

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <View style={styles.detailRoot}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailHero}>
            <ImageBackground source={{ uri: giftBox.image }} style={styles.detailHeroImage}>
              <View style={styles.detailOverlay} />
            </ImageBackground>

            <View style={[styles.detailTopControls, { paddingTop: insets.top + 8 }]}>
              <Pressable onPress={() => navigation.goBack()} style={styles.heroIconButton}>
                <MaterialIcons color={colors.text} name="arrow-back-ios-new" size={18} />
              </Pressable>
              <View style={styles.heroControlsRight}>
                <Pressable
                  onPress={() => {
                    toggleWishlist(giftBox.id);
                    Toast.show({
                      type: "success",
                      text1: isLiked ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích",
                    });
                  }}
                  style={styles.heroIconButton}
                >
                  <MaterialIcons
                    color={isLiked ? colors.primary : colors.text}
                    name={isLiked ? "favorite" : "favorite-border"}
                    size={18}
                  />
                </Pressable>
                <Pressable
                  onPress={() =>
                    Toast.show({
                      type: "info",
                      text1: "Tính năng đang phát triển",
                    })
                  }
                  style={styles.heroIconButton}
                >
                  <MaterialIcons color={colors.text} name="share" size={18} />
                </Pressable>
              </View>
            </View>

            <View style={styles.heroBottomInfo}>
              <Text
                style={[
                  styles.detailTag,
                  { backgroundColor: tagColors[giftBox.tag] ?? colors.primary },
                ]}
              >
                ✦ {giftBox.tag}
              </Text>
              <View style={styles.detailHeroPricePill}>
                <Text style={styles.detailHeroPrice}>{formatPrice(giftBox.price)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{giftBox.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.detailPrice}>{formatPrice(giftBox.price)}</Text>
              {giftBox.originalPrice ? (
                <>
                  <Text style={styles.detailOldPrice}>
                    {formatPrice(giftBox.originalPrice)}
                  </Text>
                  <Text style={styles.discountBadge}>-{discount}%</Text>
                </>
              ) : null}
            </View>

            <View style={styles.ratingRow}>
              <View style={styles.ratingStars}>
                {[0, 1, 2, 3, 4].map((item) => (
                  <MaterialIcons key={item} color={colors.gold} name="star" size={14} />
                ))}
              </View>
              <Text style={styles.ratingValue}>5.0</Text>
              <Text style={styles.ratingMeta}>(89 đánh giá)</Text>
              <View style={styles.stockRow}>
                <MaterialIcons color={colors.olive} name="inventory-2" size={14} />
                <Text style={styles.stockText}>Còn hàng</Text>
              </View>
            </View>

            <Text style={styles.detailDescription}>{giftBox.description}</Text>

            <View style={styles.quantityBox}>
              <Text style={styles.quantityLabel}>Số lượng</Text>
              <View style={styles.quantityControls}>
                <Pressable
                  onPress={() => setQuantity((value) => Math.max(1, value - 1))}
                  style={[
                    styles.quantityButton,
                    quantity === 1 && styles.quantityButtonMuted,
                  ]}
                >
                  <MaterialIcons
                    color={quantity === 1 ? colors.textMuted : colors.white}
                    name="remove"
                    size={14}
                  />
                </Pressable>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <Pressable
                  onPress={() => setQuantity((value) => value + 1)}
                  style={styles.quantityButton}
                >
                  <MaterialIcons color={colors.white} name="add" size={14} />
                </Pressable>
              </View>
            </View>
          </View>

          <SectionCard
            title="Bao gồm trong hộp"
            subtitle={`${giftBox.items.length} sản phẩm tuyển chọn`}
            rightEmoji="🎁"
          >
            {visibleItems.map((item, index) => (
              <View
                key={`${item}-${index}`}
                style={[
                  styles.itemCard,
                  index % 2 === 0 ? styles.itemCardAlt : undefined,
                ]}
              >
                <View style={styles.itemCheckWrap}>
                  <MaterialIcons color={colors.olive} name="check-circle" size={16} />
                </View>
                <Text style={styles.itemLabel}>{item}</Text>
              </View>
            ))}

            {giftBox.items.length > 4 ? (
              <Pressable
                onPress={() => setShowAllItems((value) => !value)}
                style={styles.showMoreButton}
              >
                <Text style={styles.showMoreText}>
                  {showAllItems
                    ? "Thu gọn"
                    : `Xem thêm ${giftBox.items.length - 4} sản phẩm`}
                </Text>
                <MaterialIcons
                  color={colors.primary}
                  name={showAllItems ? "expand-less" : "expand-more"}
                  size={16}
                />
              </Pressable>
            ) : null}
          </SectionCard>

          <SectionCard title="Cam kết của GiftBox">
            <View style={styles.guaranteeGrid}>
              {guarantees.map((item) => (
                <View key={item.title} style={styles.guaranteeCard}>
                  <Text style={styles.guaranteeEmoji}>{item.emoji}</Text>
                  <Text style={styles.guaranteeTitle}>{item.title}</Text>
                  <Text style={styles.guaranteeDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </SectionCard>

          <SectionCard title="Đánh giá khách hàng" rightText="5.0 (89)">
            {reviews.map((review, index) => (
              <View
                key={review.name}
                style={[
                  styles.reviewCard,
                  index < reviews.length - 1 && styles.reviewDivider,
                ]}
              >
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.name.charAt(0)}</Text>
                </View>
                <View style={styles.reviewContent}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <View style={styles.reviewMetaRow}>
                    <View style={styles.ratingStars}>
                      {[0, 1, 2, 3, 4].map((item) => (
                        <MaterialIcons
                          key={`${review.name}-${item}`}
                          color={colors.gold}
                          name="star"
                          size={10}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewTime}>{review.time}</Text>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                </View>
              </View>
            ))}
          </SectionCard>

          <View style={styles.detailSpacer} />
        </ScrollView>

        <View style={styles.detailFooter}>
          <Pressable onPress={addCurrentBox} style={styles.detailSecondaryButton}>
            <MaterialIcons color={colors.primary} name="shopping-bag" size={18} />
            <Text style={styles.detailSecondaryText}>Thêm Giỏ</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              addCurrentBox();
              navigation.navigate("MainTabs", { screen: "CartTab" });
            }}
            style={styles.detailPrimaryWrap}
          >
            <LinearGradient
              colors={[colors.primary, colors.gold]}
              style={styles.detailPrimaryButton}
            >
              <Text style={styles.detailPrimaryText}>Mua Ngay</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

export function GiftBoxBuilderScreen() {
  const navigation = useNavigation<any>();
  const addToCart = useAppStore((state) => state.addToCart);
  const setCustomBoxDraft = useAppStore((state) => state.setCustomBoxDraft);
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: api.products.list,
  });
  const [step, setStep] = useState(0);
  const [selectedBox, setSelectedBox] = useState<BoxTypeOption>(boxTypes[1]);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const products = productsQuery.data ?? [];
  const selectedProducts = useMemo(
    () =>
      products
        .filter((product) => (selectedItems[product.id] ?? 0) > 0)
        .map((product) => ({
          product,
          quantity: selectedItems[product.id],
        })),
    [products, selectedItems],
  );
  const totalItems = selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
  const productTotal = selectedProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const totalPrice = selectedBox.price + productTotal;

  const updateProduct = (product: Product, nextQty: number) => {
    const nextTotal = totalItems - (selectedItems[product.id] ?? 0) + Math.max(nextQty, 0);

    if (nextTotal > selectedBox.capacity) {
      Toast.show({
        type: "error",
        text1: `${selectedBox.name} chỉ chứa tối đa ${selectedBox.capacity} sản phẩm`,
      });
      return;
    }

    setSelectedItems((current) => {
      if (nextQty <= 0) {
        const clone = { ...current };
        delete clone[product.id];
        return clone;
      }

      return {
        ...current,
        [product.id]: nextQty,
      };
    });
  };

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <View style={styles.builderHeader}>
        <View style={styles.builderHeaderRow}>
          <Pressable
            onPress={() => (step > 0 ? setStep((value) => value - 1) : navigation.goBack())}
            style={styles.builderBackButton}
          >
            <MaterialIcons color={colors.text} name="arrow-back-ios-new" size={18} />
          </Pressable>
          <View>
            <Text style={styles.builderHeaderTitle}>Tạo Gift Box</Text>
            <Text style={styles.builderHeaderMeta}>
              Bước {step + 1} / 3
            </Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          {["Chọn hộp", "Chọn sản phẩm", "Xác nhận"].map((label, index) => (
            <View key={label} style={styles.progressItem}>
              <View
                style={[
                  styles.progressBar,
                  index <= step ? styles.progressBarActive : undefined,
                ]}
              />
              <Text
                style={[
                  styles.progressLabel,
                  index <= step ? styles.progressLabelActive : undefined,
                ]}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {step === 0 ? (
          <View style={styles.builderSection}>
            <Text style={styles.builderSectionTitle}>Chọn loại hộp/giỏ quà</Text>
            <Text style={styles.builderSectionText}>
              Mỗi loại có sức chứa và mức giá khác nhau
            </Text>

            <View style={styles.boxGrid}>
              {boxTypes.map((box) => {
                const active = selectedBox.id === box.id;

                return (
                  <Pressable
                    key={box.id}
                    onPress={() => setSelectedBox(box)}
                    style={[
                      styles.boxOption,
                      active ? styles.boxOptionActive : undefined,
                    ]}
                  >
                    <View style={styles.boxOptionTop}>
                      <Text style={styles.boxOptionEmoji}>{box.emoji}</Text>
                      {active ? (
                        <View style={styles.boxCheck}>
                          <MaterialIcons color={colors.white} name="check" size={14} />
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.boxOptionTitle,
                        active ? styles.boxOptionTitleActive : undefined,
                      ]}
                    >
                      {box.name}
                    </Text>
                    <Text
                      style={[
                        styles.boxOptionDesc,
                        active ? styles.boxOptionDescActive : undefined,
                      ]}
                    >
                      {box.description}
                    </Text>
                    <Text
                      style={[
                        styles.boxOptionPrice,
                        active ? styles.boxOptionPriceActive : undefined,
                      ]}
                    >
                      {formatPrice(box.price)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.builderSection}>
            <View style={styles.builderSectionTopRow}>
              <View>
                <Text style={styles.builderSectionTitle}>Chọn sản phẩm</Text>
                <Text style={styles.builderSectionText}>
                  Đã chọn: {totalItems}/{selectedBox.capacity}
                </Text>
              </View>
              <View
                style={[
                  styles.capacityBadge,
                  totalItems >= selectedBox.capacity && styles.capacityBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.capacityBadgeText,
                    totalItems >= selectedBox.capacity && styles.capacityBadgeTextActive,
                  ]}
                >
                  {totalItems}/{selectedBox.capacity}
                </Text>
              </View>
            </View>

            <View style={styles.capacityCard}>
              <View style={styles.capacityTrack}>
                <View
                  style={[
                    styles.capacityFill,
                    {
                      width: `${Math.min(100, (totalItems / selectedBox.capacity) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.productSelectionList}>
              {products.map((product) => {
                const selected = selectedItems[product.id] ?? 0;

                return (
                  <Pressable
                    key={product.id}
                    onPress={() => {
                      if (selected > 0) {
                        updateProduct(product, 0);
                        return;
                      }
                      updateProduct(product, 1);
                    }}
                    style={[
                      styles.productChoiceCard,
                      selected > 0 && styles.productChoiceCardActive,
                    ]}
                  >
                    <Image source={{ uri: product.image }} style={styles.productChoiceImage} />
                    <View style={styles.productChoiceContent}>
                      <Text numberOfLines={1} style={styles.productChoiceTitle}>
                        {product.name}
                      </Text>
                      <Text style={styles.productChoicePrice}>
                        {formatPrice(product.price)}
                      </Text>
                    </View>
                    {selected > 0 ? (
                      <View style={styles.productStepper}>
                        <Pressable
                          onPress={(event) => {
                            event.stopPropagation();
                            updateProduct(product, selected - 1);
                          }}
                          style={styles.productStepperSecondary}
                        >
                          <MaterialIcons color={colors.primary} name="remove" size={12} />
                        </Pressable>
                        <Text style={styles.productStepperValue}>{selected}</Text>
                        <Pressable
                          onPress={(event) => {
                            event.stopPropagation();
                            updateProduct(product, selected + 1);
                          }}
                          style={styles.productStepperPrimary}
                        >
                          <MaterialIcons color={colors.white} name="add" size={12} />
                        </Pressable>
                      </View>
                    ) : (
                      <View style={styles.productAddShell}>
                        <MaterialIcons color={colors.textMuted} name="add" size={14} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.builderSection}>
            <Text style={styles.builderSectionTitle}>Xác nhận gift box của bạn</Text>

            <View style={styles.summaryBlock}>
              <Text style={styles.summaryEyebrow}>LOẠI HỘP</Text>
              <View style={styles.summaryBoxRow}>
                <Text style={styles.summaryEmoji}>{selectedBox.emoji}</Text>
                <View style={styles.summaryBoxContent}>
                  <Text style={styles.summaryBoxTitle}>{selectedBox.name}</Text>
                  <Text style={styles.summaryBoxDesc}>{selectedBox.description}</Text>
                </View>
                <Text style={styles.summaryBoxPrice}>{formatPrice(selectedBox.price)}</Text>
              </View>
            </View>

            <View style={styles.summaryBlock}>
              <Text style={styles.summaryEyebrow}>SẢN PHẨM ({totalItems})</Text>
              {selectedProducts.length === 0 ? (
                <Text style={styles.summaryEmpty}>Chưa chọn sản phẩm nào</Text>
              ) : (
                selectedProducts.map((item) => (
                  <View key={item.product.id} style={styles.summaryProductRow}>
                    <Image
                      source={{ uri: item.product.image }}
                      style={styles.summaryProductImage}
                    />
                    <View style={styles.summaryProductContent}>
                      <Text numberOfLines={1} style={styles.summaryProductTitle}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.summaryProductQty}>x{item.quantity}</Text>
                    </View>
                    <Text style={styles.summaryProductPrice}>
                      {formatPrice(item.product.price * item.quantity)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.summaryBlock}>
              <SummaryPriceRow label="Giá hộp" value={formatPrice(selectedBox.price)} />
              <SummaryPriceRow
                label="Sản phẩm"
                value={formatPrice(productTotal)}
                dashed
              />
              <SummaryPriceRow
                label="Tổng cộng"
                value={formatPrice(totalPrice)}
                strong
              />
            </View>
          </View>
        ) : null}

        <View style={styles.builderSpacer} />
      </ScrollView>

      <View style={styles.builderFooter}>
        <Pressable
          onPress={() => {
            if (step < 2) {
              if (step === 1 && selectedProducts.length === 0) {
                Toast.show({
                  type: "error",
                  text1: "Vui lòng chọn ít nhất 1 sản phẩm",
                });
                return;
              }
              setStep((value) => value + 1);
              return;
            }

            setCustomBoxDraft({
              boxTypeId: selectedBox.id,
              boxTypeName: selectedBox.name,
              boxPrice: selectedBox.price,
              capacity: selectedBox.capacity,
              items: selectedProducts,
              totalPrice,
            });

            addToCart({
              productId: `custom-${Date.now()}`,
              name: `Custom Gift Box - ${selectedBox.name}`,
              image: selectedProducts[0]?.product.image ?? "",
              price: totalPrice,
              quantity: 1,
              type: "custom",
            });

            Toast.show({
              type: "success",
              text1: "Đã thêm Gift Box vào giỏ hàng",
            });
            navigation.navigate("MainTabs", { screen: "CartTab" });
          }}
          style={styles.builderPrimaryWrap}
        >
          <LinearGradient
            colors={[colors.primary, colors.gold]}
            style={styles.builderPrimaryButton}
          >
            <Text style={styles.builderPrimaryText}>
              {step === 0
                ? "Tiếp tục chọn sản phẩm"
                : step === 1
                  ? "Xem tổng kết"
                  : "Thêm vào Giỏ Hàng"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function GiftBoxListItem({
  giftBox,
  onPress,
}: {
  giftBox: GiftBox;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.listCard}>
      <View style={styles.listTopRow}>
        <Image source={{ uri: giftBox.image }} style={styles.listCardImage} />
        <View style={styles.listCardContent}>
          <Text style={styles.listCardTitle}>{giftBox.name}</Text>
          <Text numberOfLines={2} style={styles.listCardDescription}>
            {giftBox.description}
          </Text>
          <Text style={styles.listCardMeta}>
            {giftBox.items.length} sản phẩm trong hộp
          </Text>
          <View style={styles.listCardFooter}>
            <View style={styles.listCardPriceWrap}>
              <Text style={styles.listCardPrice}>{formatPrice(giftBox.price)}</Text>
              {giftBox.originalPrice ? (
                <Text style={styles.listCardOldPrice}>
                  {formatPrice(giftBox.originalPrice)}
                </Text>
              ) : null}
            </View>
            <View style={styles.listCta}>
              <Text style={styles.listCtaText}>Xem chi tiết</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listChipRow}
      >
        {giftBox.items.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.listChip}>
            <Text style={styles.listChipText}>
              {item.split(" ").slice(0, 2).join(" ")}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Pressable>
  );
}

function SectionCard({
  title,
  subtitle,
  rightEmoji,
  rightText,
  children,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightEmoji?: string;
  rightText?: string;
}>) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <View style={styles.sectionCardTitleWrap}>
          <Text style={styles.sectionCardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionCardSubtitle}>{subtitle}</Text> : null}
        </View>
        {rightEmoji ? (
          <View style={styles.sectionEmojiWrap}>
            <Text style={styles.sectionEmoji}>{rightEmoji}</Text>
          </View>
        ) : null}
        {rightText ? <Text style={styles.sectionRightText}>{rightText}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function SummaryPriceRow({
  label,
  value,
  strong,
  dashed,
}: {
  label: string;
  value: string;
  strong?: boolean;
  dashed?: boolean;
}) {
  return (
    <View
      style={[
        styles.summaryPriceRow,
        dashed ? styles.summaryPriceRowDashed : undefined,
      ]}
    >
      <Text style={[styles.summaryPriceLabel, strong ? styles.summaryStrongText : undefined]}>
        {label}
      </Text>
      <Text style={[styles.summaryPriceValue, strong ? styles.summaryTotalValue : undefined]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
    marginHorizontal: 20,
    marginTop: 16,
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  heroEmoji: {
    fontSize: 28,
  },
  heroTitle: {
    marginTop: spacing.sm,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "900",
    color: colors.white,
  },
  heroText: {
    marginTop: 4,
    fontSize: typography.caption,
    color: "rgba(255,255,255,0.82)",
  },
  heroButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  heroButtonText: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.primary,
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: 20,
    marginTop: spacing.base,
  },
  quickCard: {
    flex: 1,
    borderRadius: 18,
    padding: spacing.base,
  },
  quickEmoji: {
    fontSize: 24,
  },
  quickTitle: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: "800",
    color: colors.white,
  },
  quickDesc: {
    marginTop: 2,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  quickActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: spacing.sm,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  sectionMeta: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  featuredList: {
    paddingHorizontal: 20,
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  listWrap: {
    paddingHorizontal: 20,
    paddingTop: spacing.base,
    paddingBottom: spacing.xxxl,
    gap: spacing.base,
  },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    ...shadows.card,
  },
  listTopRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  listCardImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  listCardContent: {
    flex: 1,
  },
  listCardTitle: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  listCardDescription: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSoft,
  },
  listCardMeta: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
  },
  listCardFooter: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listCardPriceWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  listCardPrice: {
    fontSize: typography.title,
    fontWeight: "900",
    color: colors.primary,
  },
  listCardOldPrice: {
    fontSize: typography.tiny,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  listCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  listCtaText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.white,
  },
  listChipRow: {
    gap: 6,
    paddingTop: spacing.sm,
  },
  listChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listChipText: {
    fontSize: 10,
    color: colors.textSoft,
  },
  detailRoot: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  detailHero: {
    position: "relative",
    height: 310,
  },
  detailHeroImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(44,33,23,0.3)",
  },
  detailTopControls: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroControlsRight: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  heroIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  heroBottomInfo: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  detailTag: {
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  detailHeroPricePill: {
    backgroundColor: "rgba(0,0,0,0.48)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailHeroPrice: {
    fontSize: typography.body,
    fontWeight: "900",
    color: colors.gold,
  },
  detailCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  detailTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "900",
    color: colors.text,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  detailPrice: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primary,
  },
  detailOldPrice: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 1,
  },
  ratingValue: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  ratingMeta: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  stockText: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.olive,
  },
  detailDescription: {
    marginTop: spacing.base,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.textSoft,
  },
  quantityBox: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityLabel: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonMuted: {
    backgroundColor: colors.border,
  },
  quantityValue: {
    minWidth: 22,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  sectionCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.base,
  },
  sectionCardTitleWrap: {
    flex: 1,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  sectionCardSubtitle: {
    marginTop: 2,
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  sectionEmojiWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  sectionEmoji: {
    fontSize: 16,
  },
  sectionRightText: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  itemCardAlt: {
    backgroundColor: colors.ivory,
  },
  itemCheckWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74,93,82,0.12)",
  },
  itemLabel: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },
  showMoreButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  showMoreText: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.primary,
  },
  guaranteeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  guaranteeCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
  },
  guaranteeEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  guaranteeTitle: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.text,
  },
  guaranteeDesc: {
    marginTop: 2,
    fontSize: typography.tiny,
    color: colors.textSoft,
  },
  reviewCard: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.base,
    marginBottom: spacing.base,
  },
  reviewDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: typography.body,
  },
  reviewContent: {
    flex: 1,
  },
  reviewName: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  reviewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 2,
  },
  reviewTime: {
    fontSize: 10,
    color: colors.textMuted,
  },
  reviewText: {
    marginTop: spacing.sm,
    fontSize: typography.caption,
    lineHeight: 18,
    color: colors.textSoft,
  },
  detailSpacer: {
    height: 100,
  },
  detailFooter: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: spacing.base,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailSecondaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  detailSecondaryText: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.primary,
  },
  detailPrimaryWrap: {
    flex: 1,
  },
  detailPrimaryButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.primary,
  },
  detailPrimaryText: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.white,
  },
  builderHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  builderHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  builderBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  builderHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  builderHeaderMeta: {
    marginTop: 2,
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  progressRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  progressItem: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: 6,
  },
  progressBarActive: {
    backgroundColor: colors.primary,
  },
  progressLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "700",
  },
  progressLabelActive: {
    color: colors.primary,
  },
  builderSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  builderSectionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  builderSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  builderSectionText: {
    marginTop: 4,
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  boxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  boxOption: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.base,
    ...shadows.sm,
  },
  boxOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primary,
  },
  boxOptionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  boxOptionEmoji: {
    fontSize: 28,
  },
  boxCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  boxOptionTitle: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  boxOptionTitleActive: {
    color: colors.white,
  },
  boxOptionDesc: {
    marginTop: 2,
    fontSize: typography.tiny,
    color: colors.textSoft,
  },
  boxOptionDescActive: {
    color: "rgba(255,255,255,0.78)",
  },
  boxOptionPrice: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    fontWeight: "900",
    color: colors.primary,
  },
  boxOptionPriceActive: {
    color: colors.gold,
  },
  capacityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  capacityBadgeActive: {
    backgroundColor: colors.primary,
  },
  capacityBadgeText: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.primary,
  },
  capacityBadgeTextActive: {
    color: colors.white,
  },
  capacityCard: {
    marginBottom: spacing.base,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 14,
  },
  capacityTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  capacityFill: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  productSelectionList: {
    gap: spacing.sm,
  },
  productChoiceCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.sm,
  },
  productChoiceCardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.primary,
  },
  productChoiceImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  productChoiceContent: {
    flex: 1,
  },
  productChoiceTitle: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
  },
  productChoicePrice: {
    marginTop: 2,
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.primary,
  },
  productStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productStepperSecondary: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  productStepperPrimary: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  productStepperValue: {
    minWidth: 14,
    textAlign: "center",
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  productAddShell: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryBlock: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    marginTop: spacing.base,
  },
  summaryEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSoft,
    marginBottom: spacing.base,
  },
  summaryBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  summaryEmoji: {
    fontSize: 28,
  },
  summaryBoxContent: {
    flex: 1,
  },
  summaryBoxTitle: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  summaryBoxDesc: {
    marginTop: 2,
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  summaryBoxPrice: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.primary,
  },
  summaryEmpty: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  summaryProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryProductImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  summaryProductContent: {
    flex: 1,
  },
  summaryProductTitle: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
  },
  summaryProductQty: {
    marginTop: 2,
    fontSize: typography.tiny,
    color: colors.textSoft,
  },
  summaryProductPrice: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.primary,
  },
  summaryPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryPriceRowDashed: {
    marginBottom: 4,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryPriceLabel: {
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  summaryPriceValue: {
    fontSize: typography.caption,
    color: colors.text,
  },
  summaryStrongText: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: typography.h3,
    fontWeight: "900",
    color: colors.primary,
  },
  builderSpacer: {
    height: 96,
  },
  builderFooter: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: spacing.base,
    paddingBottom: 28,
  },
  builderPrimaryWrap: {
    width: "100%",
  },
  builderPrimaryButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.primary,
  },
  builderPrimaryText: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.white,
  },
});
