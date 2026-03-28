import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";
import { z } from "zod";
import { AddressCard } from "../../../components/cards/AddressCard";
import { ProductCard } from "../../../components/cards/ProductCard";
import { AppScreen, EmptyState, Field } from "../../../components/common/Primitives";
import { AppHeader } from "../../../components/navigation/AppHeader";
import { giftBoxes, products } from "../../../mocks/data";
import { api } from "../../../services/mockApi";
import { useAppStore } from "../../../store/useAppStore";
import { Address } from "../../../types/domain";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";
import { formatPrice, getStatusLabel, getStatusTone } from "../../../utils/format";

const profileSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  email: z.email("Email không hợp lệ"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
});

const addressSchema = z.object({
  label: z.string().min(2, "Chọn loại địa chỉ"),
  fullName: z.string().min(2, "Vui lòng nhập người nhận"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  address: z.string().min(4, "Vui lòng nhập địa chỉ cụ thể"),
  ward: z.string().min(2, "Vui lòng nhập phường/xã"),
  district: z.string().min(2, "Vui lòng nhập quận/huyện"),
  city: z.string().min(2, "Vui lòng nhập tỉnh/thành phố"),
  isDefault: z.boolean(),
});

type ProfileValues = z.infer<typeof profileSchema>;
type AddressValues = z.infer<typeof addressSchema>;

export function AccountScreen() {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const orders = useAppStore((state) => state.orders);
  const wishlist = useAppStore((state) => state.wishlist);
  const logout = useAppStore((state) => state.logout);

  const profileQuery = useQuery({
    queryKey: ["profile", "account"],
    queryFn: api.profile.get,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    setUser(profileQuery.data);
  }, [profileQuery.data, setUser]);

  if (!isAuthenticated) {
    return (
      <AppScreen backgroundColor={colors.ivory}>
        <AppHeader title="Tài Khoản" showBack={false} />
        <EmptyState
          icon="person-outline"
          title="Bạn chưa đăng nhập"
          subtitle="Đăng nhập để xem hồ sơ, theo dõi đơn hàng và quản lý thông tin cá nhân."
          actionLabel="Đăng nhập ngay"
          onPressAction={() => navigation.navigate("SignIn")}
        />
      </AppScreen>
    );
  }

  const orderStats = [
    { label: "Tất cả", count: orders.length },
    {
      label: "Đang giao",
      count: orders.filter((order) => order.status === "shipping").length,
    },
    {
      label: "Đã giao",
      count: orders.filter((order) => order.status === "delivered").length,
    },
  ];

  const menuSections = [
    {
      title: "Tài khoản",
      items: [
        { icon: "person-outline", label: "Chỉnh sửa hồ sơ", route: "EditProfile" },
        { icon: "location-on", label: "Địa chỉ giao hàng", route: "AddressList" },
        { icon: "lock-outline", label: "Đổi mật khẩu", route: "ChangePassword" },
      ],
    },
    {
      title: "Mua sắm",
      items: [
        { icon: "shopping-bag", label: "Đơn hàng của tôi", route: "orders" },
        { icon: "favorite-border", label: "Sản phẩm yêu thích", route: "Wishlist" },
        { icon: "local-offer", label: "Voucher của tôi", route: "VoucherCenter" },
      ],
    },
    {
      title: "Hỗ trợ",
      items: [
        { icon: "smart-toy", label: "Chatbot tư vấn", route: "Chatbot" },
        { icon: "notifications-none", label: "Thông báo", route: "Notifications" },
        { icon: "settings", label: "Cài đặt", route: "settings" },
      ],
    },
  ];

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <AppHeader
        title="Tài Khoản"
        showBack={false}
        showNotification
        onPressRight={() => navigation.navigate("Notifications")}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={profileQuery.isFetching}
            onRefresh={() => {
              void profileQuery.refetch();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {profileQuery.isError ? (
          <View style={styles.profileSyncError}>
            <MaterialIcons color={colors.error} name="sync-problem" size={14} />
            <Text style={styles.profileSyncErrorText}>
              Không thể đồng bộ hồ sơ từ server. Đang hiển thị dữ liệu gần nhất.
            </Text>
          </View>
        ) : null}
        <View style={styles.profileHero}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0).toUpperCase() ?? "U"}
              </Text>
              <Pressable
                onPress={() => navigation.navigate("EditProfile")}
                style={styles.avatarEdit}
              >
                <MaterialIcons color={colors.white} name="edit" size={10} />
              </Pressable>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.fullName ?? "Tài khoản khách"}</Text>
              <Text style={styles.profileMeta}>{user?.email ?? "Vui lòng đăng nhập"}</Text>
              <Text style={styles.profileMeta}>{user?.phone ?? "Chưa cập nhật số điện thoại"}</Text>
            </View>

            {wishlist.length > 0 ? (
              <Pressable
                onPress={() => navigation.navigate("Wishlist")}
                style={styles.wishlistQuick}
              >
                <MaterialIcons color={colors.gold} name="favorite" size={18} />
                <Text style={styles.wishlistQuickText}>{wishlist.length}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.statsGrid}>
            {orderStats.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => navigation.navigate("MainTabs", { screen: "OrdersTab" })}
                style={styles.statCard}
              >
                <Text style={styles.statValue}>{item.count}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
          <Pressable onPress={() => navigation.navigate("MainTabs", { screen: "OrdersTab" })}>
            <Text style={styles.sectionLink}>Xem tất cả →</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentOrdersRow}
        >
          {orders.slice(0, 3).map((order) => (
            <Pressable
              key={order.id}
              onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
              style={styles.recentOrderCard}
            >
              <Image source={{ uri: order.items[0]?.image }} style={styles.recentOrderImage} />
              <Text numberOfLines={1} style={styles.recentOrderId}>
                {order.id}
              </Text>
              <Text
                style={[
                  styles.recentOrderStatus,
                  { color: getStatusTone(order.status) },
                ]}
              >
                {getStatusLabel(order.status)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.menuSections}>
          {menuSections.map((section) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.title.toUpperCase()}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, index) => (
                  <Pressable
                    key={item.label}
                    onPress={() => {
                      if (item.route === "orders") {
                        navigation.navigate("MainTabs", { screen: "OrdersTab" });
                        return;
                      }
                      if (item.route === "settings" || item.route === "change-password") {
                        Toast.show({
                          type: "info",
                          text1: "Tính năng đang phát triển",
                        });
                        return;
                      }
                      navigation.navigate(item.route);
                    }}
                    style={[
                      styles.menuRow,
                      index < section.items.length - 1 && styles.menuDivider,
                    ]}
                  >
                    <View style={styles.menuLeft}>
                      <View style={styles.menuIconWrap}>
                        <MaterialIcons color={colors.primary} name={item.icon as any} size={16} />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    <MaterialIcons color={colors.borderDark} name="chevron-right" size={18} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <Pressable
            onPress={() => {
              logout();
              Toast.show({ type: "success", text1: "Đăng xuất thành công" });
              navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
            }}
            style={styles.logoutButton}
          >
            <MaterialIcons color={colors.error} name="logout" size={18} />
            <Text style={styles.logoutText}>Đăng Xuất</Text>
          </Pressable>

          <Text style={styles.versionText}>GiftBox v1.0.0 • Premium Gift Collection</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

export function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAppStore((state) => state.user);
  const updateProfile = useAppStore((state) => state.updateProfile);

  const { control, handleSubmit, formState } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
    mode: "onChange",
  });

  return (
    <AppScreen backgroundColor={colors.ivory} padded keyboard>
      <AppHeader title="Chỉnh Sửa Hồ Sơ" onBack={() => navigation.goBack()} />
      <View style={styles.formHeroCard}>
        <View style={styles.formAvatar}>
          <Text style={styles.formAvatarText}>{user?.fullName?.charAt(0) ?? "U"}</Text>
        </View>
        <Text style={styles.formHeroName}>{user?.fullName ?? "Người dùng GiftBox"}</Text>
        <Text style={styles.formHeroMeta}>Cập nhật thông tin để trải nghiệm mua sắm thuận tiện hơn</Text>
      </View>

      <Controller
        control={control}
        name="fullName"
        render={({ field, fieldState }) => (
          <Field
            label="Họ và tên"
            icon="person-outline"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Field
            label="Email"
            icon="mail-outline"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            autoCapitalize="none"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <Field
            label="Số điện thoại"
            icon="phone-iphone"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            keyboardType="phone-pad"
            error={fieldState.error?.message}
          />
        )}
      />

      <PrimaryAction
        label="Lưu Hồ Sơ"
        onPress={handleSubmit((values) => {
          updateProfile(values);
          Toast.show({ type: "success", text1: "Đã cập nhật hồ sơ" });
          navigation.goBack();
        })}
        disabled={!formState.isValid}
      />
    </AppScreen>
  );
}

export function AddressListScreen() {
  const navigation = useNavigation<any>();
  const addresses = useAppStore((state) => state.addresses);
  const setDefaultAddress = useAppStore((state) => state.setDefaultAddress);
  const deleteAddress = useAppStore((state) => state.deleteAddress);

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <AppHeader title="Địa Chỉ Giao Hàng" onBack={() => navigation.goBack()} />
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.addressList} showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <EmptyState
              icon="place"
              title="Chưa có địa chỉ"
              subtitle="Thêm địa chỉ giao hàng để đặt hàng nhanh hơn trong những lần tiếp theo."
            />
          ) : (
            addresses.map((address) => (
              <View key={address.id} style={styles.addressBlock}>
                <AddressCard
                  address={address}
                  selected={address.isDefault}
                  onPress={() => setDefaultAddress(address.id)}
                  onEdit={() => navigation.navigate("AddressForm", { addressId: address.id })}
                />
                <View style={styles.addressActions}>
                  {!address.isDefault ? (
                    <Pressable
                      onPress={() => {
                        setDefaultAddress(address.id);
                        Toast.show({ type: "success", text1: "Đã đặt làm mặc định" });
                      }}
                    >
                      <Text style={styles.addressActionPrimary}>Đặt mặc định</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.addressDefaultText}>Đang là địa chỉ mặc định</Text>
                  )}
                  <Pressable
                    onPress={() => {
                      deleteAddress(address.id);
                      Toast.show({ type: "success", text1: "Đã xóa địa chỉ" });
                    }}
                  >
                    <Text style={styles.addressActionDanger}>Xóa</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.bottomActionShell}>
          <PrimaryAction
            label="Thêm Địa Chỉ Mới"
            icon="add"
            onPress={() => navigation.navigate("AddressForm")}
          />
        </View>
      </View>
    </AppScreen>
  );
}

export function AddressFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const addresses = useAppStore((state) => state.addresses);
  const upsertAddress = useAppStore((state) => state.upsertAddress);
  const current = addresses.find((item) => item.id === route.params?.addressId);

  const { control, handleSubmit, setValue, watch, formState } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: current?.label ?? "Nhà riêng",
      fullName: current?.fullName ?? "",
      phone: current?.phone ?? "",
      address: current?.address ?? "",
      ward: current?.ward ?? "",
      district: current?.district ?? "",
      city: current?.city ?? "",
      isDefault: current?.isDefault ?? addresses.length === 0,
    },
    mode: "onChange",
  });

  const selectedLabel = watch("label");
  const isDefault = watch("isDefault");

  return (
    <AppScreen backgroundColor={colors.ivory} padded keyboard>
      <AppHeader
        title={current ? "Sửa Địa Chỉ" : "Thêm Địa Chỉ"}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.labelSection}>
        <Text style={styles.fieldTitle}>Loại địa chỉ</Text>
        <View style={styles.labelChips}>
          {["Nhà riêng", "Văn phòng", "Khác"].map((label) => {
            const active = selectedLabel === label;

            return (
              <Pressable
                key={label}
                onPress={() => setValue("label", label, { shouldValidate: true })}
                style={[styles.labelChip, active && styles.labelChipActive]}
              >
                <Text style={[styles.labelChipText, active && styles.labelChipTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {(
        [
          ["fullName", "Họ và tên người nhận *", "person-outline"],
          ["phone", "Số điện thoại *", "phone-iphone"],
          ["address", "Địa chỉ cụ thể *", "home-work"],
          ["ward", "Phường/Xã", "pin-drop"],
          ["district", "Quận/Huyện", "map"],
          ["city", "Tỉnh/Thành phố", "location-city"],
        ] as Array<[keyof AddressValues, string, string]>
      ).map(([name, label, icon]) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <Field
              label={label}
              icon={icon as any}
              value={typeof field.value === "string" ? field.value : ""}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              keyboardType={name === "phone" ? "phone-pad" : "default"}
              error={fieldState.error?.message}
            />
          )}
        />
      ))}

      <View style={styles.defaultToggleCard}>
        <View style={styles.defaultToggleContent}>
          <Text style={styles.defaultToggleTitle}>Đặt làm địa chỉ mặc định</Text>
          <Text style={styles.defaultToggleDesc}>
            Địa chỉ này sẽ được chọn tự động khi thanh toán
          </Text>
        </View>
        <Controller
          control={control}
          name="isDefault"
          render={({ field }) => (
            <Switch
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
              trackColor={{ false: colors.borderDark, true: colors.primary }}
              thumbColor={colors.white}
            />
          )}
        />
      </View>

      <PrimaryAction
        label={current ? "Lưu Địa Chỉ" : "Tạo Địa Chỉ"}
        onPress={handleSubmit((values) => {
          const nextAddress: Address = {
            id: current?.id ?? `addr-${Date.now()}`,
            ...values,
          };
          upsertAddress(nextAddress);
          Toast.show({ type: "success", text1: "Đã lưu địa chỉ" });
          navigation.goBack();
        })}
        disabled={!formState.isValid}
      />
    </AppScreen>
  );
}

export function WishlistScreen() {
  const navigation = useNavigation<any>();
  const wishlist = useAppStore((state) => state.wishlist);
  const toggleWishlist = useAppStore((state) => state.toggleWishlist);
  const addToCart = useAppStore((state) => state.addToCart);

  const wishlistedProducts = products.filter((product) => wishlist.includes(product.id));
  const wishlistedGiftBoxes = giftBoxes.filter((item) => wishlist.includes(item.id));
  const isEmpty = wishlistedProducts.length === 0 && wishlistedGiftBoxes.length === 0;

  if (isEmpty) {
    return (
      <AppScreen backgroundColor={colors.ivory}>
        <AppHeader title="Sản Phẩm Yêu Thích" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="favorite-border"
          title="Chưa có sản phẩm yêu thích"
          subtitle="Nhấn biểu tượng trái tim trên sản phẩm hoặc hộp quà để lưu vào đây."
          actionLabel="Khám phá ngay"
          onPressAction={() => navigation.navigate("MainTabs", { screen: "ExploreTab" })}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor={colors.ivory} scroll={false}>
      <AppHeader title="Sản Phẩm Yêu Thích" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.wishlistContent} showsVerticalScrollIndicator={false}>
        {wishlistedProducts.length > 0 ? (
          <View style={styles.wishlistSection}>
            <View style={styles.wishlistHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{wishlistedProducts.length}</Text>
              </View>
            </View>
            <View style={styles.wishlistList}>
              {wishlistedProducts.map((product) => (
                <View key={product.id} style={styles.wishlistProductWrap}>
                  <ProductCard
                    mode="list"
                    product={product}
                    onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
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
                  <Pressable
                    onPress={() => {
                      toggleWishlist(product.id);
                      Toast.show({ type: "success", text1: "Đã xóa khỏi yêu thích" });
                    }}
                    style={styles.removeFavorite}
                  >
                    <MaterialIcons color={colors.error} name="delete-outline" size={14} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {wishlistedGiftBoxes.length > 0 ? (
          <View style={styles.wishlistSection}>
            <View style={styles.wishlistHeader}>
              <Text style={styles.sectionTitle}>Hộp quà</Text>
              <View style={[styles.countBadge, styles.countBadgeGold]}>
                <Text style={styles.countBadgeText}>{wishlistedGiftBoxes.length}</Text>
              </View>
            </View>
            <View style={styles.wishlistList}>
              {wishlistedGiftBoxes.map((giftBox) => (
                <Pressable
                  key={giftBox.id}
                  onPress={() => navigation.navigate("GiftBoxDetail", { giftBoxId: giftBox.id })}
                  style={styles.favoriteGiftCard}
                >
                  <Image source={{ uri: giftBox.image }} style={styles.favoriteGiftImage} />
                  <View style={styles.favoriteGiftContent}>
                    <Text numberOfLines={1} style={styles.favoriteGiftTitle}>
                      {giftBox.name}
                    </Text>
                    <Text numberOfLines={1} style={styles.favoriteGiftMeta}>
                      {giftBox.items.slice(0, 2).join(", ")}...
                    </Text>
                    <View style={styles.favoriteGiftFooter}>
                      <Text style={styles.favoriteGiftPrice}>{formatPrice(giftBox.price)}</Text>
                      <View style={styles.favoriteGiftActions}>
                        <Pressable
                          onPress={(event) => {
                            event.stopPropagation();
                            toggleWishlist(giftBox.id);
                            Toast.show({ type: "success", text1: "Đã xóa khỏi yêu thích" });
                          }}
                          style={styles.giftActionDanger}
                        >
                          <MaterialIcons color={colors.error} name="delete-outline" size={12} />
                        </Pressable>
                        <Pressable
                          onPress={(event) => {
                            event.stopPropagation();
                            addToCart({
                              productId: giftBox.id,
                              name: giftBox.name,
                              image: giftBox.image,
                              price: giftBox.price,
                              quantity: 1,
                              type: "giftbox",
                            });
                            Toast.show({ type: "success", text1: "Đã thêm vào giỏ hàng" });
                          }}
                          style={styles.giftActionPrimary}
                        >
                          <Text style={styles.giftActionPrimaryText}>Thêm giỏ</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={() => {
            wishlist.forEach((id) => toggleWishlist(id));
            Toast.show({ type: "success", text1: "Đã xóa toàn bộ yêu thích" });
          }}
          style={styles.clearWishlistButton}
        >
          <MaterialIcons color={colors.textMuted} name="delete-outline" size={16} />
          <Text style={styles.clearWishlistText}>Xóa tất cả</Text>
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
}

function PrimaryAction({
  label,
  onPress,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={styles.primaryActionWrap}>
      <View style={[styles.primaryAction, disabled && styles.primaryActionDisabled]}>
        {icon ? <MaterialIcons color={colors.white} name={icon} size={18} /> : null}
        <Text style={styles.primaryActionText}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  profileSyncError: {
    marginHorizontal: 20,
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#F5BCBC",
    backgroundColor: colors.errorSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  profileSyncErrorText: {
    flex: 1,
    fontSize: typography.caption,
    color: colors.error,
  },
  profileHero: {
    marginHorizontal: 20,
    marginTop: spacing.base,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    padding: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    position: "relative",
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(201,168,76,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.white,
  },
  avatarEdit: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
  },
  profileMeta: {
    marginTop: 2,
    fontSize: typography.caption,
    color: "rgba(255,255,255,0.76)",
  },
  wishlistQuick: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
  },
  wishlistQuickText: {
    marginTop: 2,
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.gold,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  sectionLink: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.primary,
  },
  recentOrdersRow: {
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: spacing.base,
  },
  recentOrderCard: {
    width: 130,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  recentOrderImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  recentOrderId: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  recentOrderStatus: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "800",
  },
  menuSections: {
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 0.7,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.card,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
  },
  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: typography.body,
    color: colors.text,
  },
  logoutButton: {
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: "#F5BCBC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.error,
  },
  versionText: {
    marginTop: spacing.base,
    fontSize: typography.tiny,
    color: colors.borderDark,
    textAlign: "center",
  },
  formHeroCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.base,
    ...shadows.card,
  },
  formAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  formAvatarText: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.white,
  },
  formHeroName: {
    marginTop: spacing.base,
    fontSize: typography.h3,
    fontWeight: "800",
    color: colors.text,
  },
  formHeroMeta: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSoft,
    textAlign: "center",
  },
  primaryActionWrap: {
    marginTop: spacing.base,
    marginBottom: spacing.base,
  },
  primaryAction: {
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.primary,
  },
  primaryActionDisabled: {
    opacity: 0.5,
  },
  primaryActionText: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.white,
  },
  addressList: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: spacing.base,
  },
  addressBlock: {
    gap: spacing.sm,
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
  },
  addressActionPrimary: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.primary,
  },
  addressActionDanger: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.error,
  },
  addressDefaultText: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  bottomActionShell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: spacing.base,
    paddingBottom: 28,
  },
  labelSection: {
    marginBottom: spacing.base,
  },
  fieldTitle: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  labelChips: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  labelChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  labelChipText: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.textSoft,
  },
  labelChipTextActive: {
    color: colors.white,
  },
  defaultToggleCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.base,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  defaultToggleContent: {
    flex: 1,
    paddingRight: spacing.base,
  },
  defaultToggleTitle: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  defaultToggleDesc: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  wishlistContent: {
    paddingHorizontal: 20,
    paddingBottom: spacing.xxxl,
    gap: spacing.base,
  },
  wishlistSection: {
    gap: spacing.sm,
  },
  wishlistHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  countBadgeGold: {
    backgroundColor: colors.gold,
  },
  countBadgeText: {
    fontSize: typography.tiny,
    fontWeight: "800",
    color: colors.white,
  },
  wishlistList: {
    gap: spacing.base,
  },
  wishlistProductWrap: {
    position: "relative",
  },
  removeFavorite: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: "#F5BCBC",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteGiftCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
    flexDirection: "row",
    gap: spacing.sm,
    ...shadows.card,
  },
  favoriteGiftImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
  },
  favoriteGiftContent: {
    flex: 1,
  },
  favoriteGiftTitle: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  favoriteGiftMeta: {
    marginTop: 2,
    fontSize: typography.caption,
    color: colors.textSoft,
  },
  favoriteGiftFooter: {
    marginTop: spacing.base,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favoriteGiftPrice: {
    fontSize: typography.title,
    fontWeight: "900",
    color: colors.primary,
  },
  favoriteGiftActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  giftActionDanger: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: "#F5BCBC",
    alignItems: "center",
    justifyContent: "center",
  },
  giftActionPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  giftActionPrimaryText: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.white,
  },
  clearWishlistButton: {
    marginTop: spacing.base,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  clearWishlistText: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.textMuted,
  },
});
