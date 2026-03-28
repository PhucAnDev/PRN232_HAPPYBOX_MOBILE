import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { z } from "zod";
import { api } from "../../../services/mockApi";
import { useAppStore } from "../../../store/useAppStore";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";

const slides = [
  {
    id: "slide-1",
    emoji: "🎁",
    title: "Khám Phá Quà Tặng\nCao Cấp",
    description:
      "Tuyển chọn những hộp quà sang trọng, tinh tế từ các thương hiệu danh tiếng trong và ngoài nước.",
    colors: [colors.primaryDark, colors.primary] as const,
    accent: colors.gold,
  },
  {
    id: "slide-2",
    emoji: "✨",
    title: "Tự Thiết Kế\nGift Box Của Bạn",
    description:
      "Cá nhân hóa từng chi tiết, chọn sản phẩm, phối màu và tạo nên món quà đúng với câu chuyện riêng.",
    colors: [colors.goldDark, colors.gold] as const,
    accent: colors.white,
  },
  {
    id: "slide-3",
    emoji: "📦",
    title: "Đặt Hàng Dễ Dàng\nGiao Tận Nơi",
    description:
      "Thanh toán nhanh, theo dõi đơn hàng theo thời gian thực và nhận quà đúng hẹn trên khắp Việt Nam.",
    colors: ["#2C3A30", colors.olive] as const,
    accent: colors.gold,
  },
];

const signInSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Vui lòng nhập họ tên"),
    email: z.email("Email không hợp lệ"),
    phone: z.string().min(9, "Số điện thoại không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Nhập lại mật khẩu"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

const forgotSchema = z.object({
  email: z.email("Email không hợp lệ"),
});

const resetPasswordSchema = z
  .object({
    email: z.email("Email không hợp lệ"),
    otp: z.string().length(6, "OTP phải gồm đúng 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Nhập lại mật khẩu"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function SplashScreen() {
  const navigation = useNavigation<any>();
  const onboardingDone = useAppStore((state) => state.onboardingDone);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const authTokens = useAppStore((state) => state.authTokens);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && authTokens?.accessToken) {
        navigation.replace("MainTabs");
      } else if (onboardingDone) {
        navigation.replace("SignIn");
      } else {
        navigation.replace("Onboarding");
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [authTokens?.accessToken, isAuthenticated, navigation, onboardingDone]);

  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary, colors.gold]}
      style={styles.splashRoot}
    >
      <View style={styles.splashLogoWrap}>
        <Text style={styles.splashEmoji}>🎁</Text>
      </View>
      <Text style={styles.splashTitle}>GiftBox</Text>
      <Text style={styles.splashSubtitle}>PREMIUM GIFT COLLECTION</Text>
      <View style={styles.splashDecorRow}>
        <View style={styles.splashLine} />
        <View style={styles.splashDot} />
        <View style={styles.splashLine} />
      </View>
      <View style={styles.loadingDots}>
        {[0, 1, 2].map((item) => (
          <View
            key={item}
            style={[
              styles.loadingDot,
              item === 1 ? styles.loadingDotActive : undefined,
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

export function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const finish = () => {
    completeOnboarding();
    navigation.replace("SignIn");
  };

  return (
    <LinearGradient colors={slide.colors} style={styles.onboardingRoot}>
      <View style={styles.onboardingTopBar}>
        {index < slides.length - 1 ? (
          <Pressable onPress={finish}>
            <Text style={styles.onboardingSkip}>Bỏ qua</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <View style={styles.onboardingCenter}>
        <View style={styles.onboardingEmojiWrap}>
          <Text style={styles.onboardingEmoji}>{slide.emoji}</Text>
        </View>
        <Text style={styles.onboardingTitle}>{slide.title}</Text>
        <Text style={styles.onboardingDescription}>{slide.description}</Text>
      </View>

      <View style={styles.onboardingFooter}>
        <View style={styles.onboardingDots}>
          {slides.map((item, itemIndex) => (
            <Pressable
              key={item.id}
              onPress={() => setIndex(itemIndex)}
              style={[
                styles.onboardingDot,
                itemIndex === index && {
                  width: 26,
                  backgroundColor: slide.accent,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={() => {
            if (index === slides.length - 1) {
              finish();
              return;
            }
            setIndex((value) => value + 1);
          }}
          style={styles.onboardingButtonWrap}
        >
          <View
            style={[
              styles.onboardingButton,
              { backgroundColor: slide.accent },
            ]}
          >
            <Text
              style={[
                styles.onboardingButtonText,
                {
                  color:
                    index === slides.length - 1 ? colors.primary : colors.text,
                },
              ]}
            >
              {index === slides.length - 1 ? "Bắt Đầu Ngay" : "Tiếp Theo"}
            </Text>
            <Text
              style={[
                styles.onboardingArrow,
                {
                  color:
                    index === slides.length - 1 ? colors.primary : colors.text,
                },
              ]}
            >
              →
            </Text>
          </View>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

export function SignInScreen() {
  const navigation = useNavigation<any>();
  const login = useAppStore((state) => state.login);
  const [secure, setSecure] = useState(true);
  const { control, handleSubmit, formState } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (payload: SignInValues) =>
      api.auth.signIn(payload.email, payload.password),
    onSuccess: ({ user, tokens }) => {
      login(user, tokens);
      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công",
        text2: "Chào mừng bạn quay lại GiftBox.",
      });
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    },
    onError: (error) => {
      const message = api.errors.getMessage(
        error,
        "Vui lòng kiểm tra lại email và mật khẩu.",
      );
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2: message,
      });
    },
  });

  return (
    <AuthLayout
      backLabel="← Quay lại"
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục mua sắm và quản lý các đơn quà tặng của bạn."
      onBack={() => navigation.navigate("Onboarding")}
      brand
    >
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <AuthInput
            label="Email"
            icon="mail-outline"
            placeholder="your@email.com"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <AuthInput
            label="Mật khẩu"
            icon="lock-outline"
            placeholder="Nhập mật khẩu"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            secureTextEntry={secure}
            autoCapitalize="none"
            error={fieldState.error?.message}
            right={
              <Pressable onPress={() => setSecure((value) => !value)}>
                <MaterialIcons
                  color={colors.textMuted}
                  name={secure ? "visibility" : "visibility-off"}
                  size={18}
                />
              </Pressable>
            }
          />
        )}
      />

      <Pressable
        onPress={() => navigation.navigate("ForgotPassword")}
        style={styles.inlineLinkWrap}
      >
        <Text style={styles.inlineLink}>Quên mật khẩu?</Text>
      </Pressable>

      <GradientButton
        label={mutation.isPending ? "Đang đăng nhập..." : "Đăng Nhập"}
        onPress={handleSubmit((values) => mutation.mutate(values))}
        disabled={mutation.isPending || !formState.isValid}
        loading={mutation.isPending}
      />

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>hoặc</Text>
        <View style={styles.divider} />
      </View>

      <Pressable
        onPress={() =>
          Toast.show({
            type: "info",
            text1: "Tính năng đang phát triển",
            text2: "Đăng nhập Google sẽ được bổ sung sau.",
          })
        }
        style={styles.googleButton}
      >
        <Text style={styles.googleEmoji}>🇬</Text>
        <Text style={styles.googleText}>Tiếp tục với Google</Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Chưa có tài khoản?</Text>
        <Pressable onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.footerLink}>Đăng ký ngay</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

export function SignUpScreen() {
  const navigation = useNavigation<any>();
  const signup = useAppStore((state) => state.signup);
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const { control, handleSubmit, formState } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (payload: SignUpValues) =>
      api.auth.signUp({
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
      }),
    onSuccess: ({ user, tokens }) => {
      signup(user, tokens);
      Toast.show({
        type: "success",
        text1: "Tạo tài khoản thành công",
        text2: "Chào mừng bạn đến với GiftBox.",
      });
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Đăng ký thất bại",
        text2: api.errors.getMessage(error, "Không thể tạo tài khoản."),
      });
    },
  });

  return (
    <AuthLayout
      backLabel="← Đã có tài khoản? Đăng nhập"
      title="Tạo tài khoản mới"
      subtitle="Tham gia cộng đồng quà tặng cao cấp và khám phá những bộ sưu tập được tuyển chọn sẵn."
      onBack={() => navigation.goBack()}
      brand
    >
      <Controller
        control={control}
        name="fullName"
        render={({ field, fieldState }) => (
          <AuthInput
            label="Họ và tên"
            icon="person-outline"
            placeholder="Nguyễn Văn A"
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
          <AuthInput
            label="Email"
            icon="mail-outline"
            placeholder="your@email.com"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <AuthInput
            label="Số điện thoại"
            icon="phone-iphone"
            placeholder="0901234567"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            keyboardType="phone-pad"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <AuthInput
            label="Mật khẩu"
            icon="lock-outline"
            placeholder="Nhập mật khẩu"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            secureTextEntry={secure}
            autoCapitalize="none"
            error={fieldState.error?.message}
            right={
              <Pressable onPress={() => setSecure((value) => !value)}>
                <MaterialIcons
                  color={colors.textMuted}
                  name={secure ? "visibility" : "visibility-off"}
                  size={18}
                />
              </Pressable>
            }
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <AuthInput
            label="Xác nhận mật khẩu"
            icon="lock-outline"
            placeholder="Nhập lại mật khẩu"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            secureTextEntry={secureConfirm}
            autoCapitalize="none"
            error={fieldState.error?.message}
            right={
              <Pressable onPress={() => setSecureConfirm((value) => !value)}>
                <MaterialIcons
                  color={colors.textMuted}
                  name={secureConfirm ? "visibility" : "visibility-off"}
                  size={18}
                />
              </Pressable>
            }
          />
        )}
      />

      <Text style={styles.termsText}>
        Bằng cách đăng ký, bạn đồng ý với{" "}
        <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{" "}
        <Text style={styles.termsLink}>Chính sách bảo mật</Text> của GiftBox.
      </Text>

      <GradientButton
        label={mutation.isPending ? "Đang đăng ký..." : "Đăng Ký"}
        onPress={handleSubmit((values) => mutation.mutate(values))}
        disabled={mutation.isPending || !formState.isValid}
        loading={mutation.isPending}
      />
    </AuthLayout>
  );
}

export function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [sentEmail, setSentEmail] = useState("");
  const {
    control: forgotControl,
    handleSubmit: submitForgot,
    formState: forgotFormState,
    reset: resetForgotForm,
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const {
    control: resetControl,
    handleSubmit: submitReset,
    formState: resetFormState,
    watch: watchReset,
    reset: resetResetForm,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const forgotMutation = useMutation({
    mutationFn: (payload: ForgotValues) => api.auth.forgotPassword(payload.email),
    onSuccess: (_data, payload) => {
      setSentEmail(payload.email);
      resetForgotForm({ email: "" });
      resetResetForm({
        email: payload.email,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
      Toast.show({
        type: "success",
        text1: "Đã gửi email khôi phục",
        text2: "Vui lòng kiểm tra hộp thư của bạn.",
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Không gửi được email",
        text2: api.errors.getMessage(error, "Vui lòng thử lại."),
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (payload: ResetPasswordValues) => api.auth.resetPassword(payload),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Đặt lại mật khẩu thành công",
        text2: "Bạn có thể đăng nhập lại với mật khẩu mới.",
      });
      setSentEmail("");
      resetResetForm({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
      navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Đặt lại mật khẩu thất bại",
        text2: api.errors.getMessage(error, "Vui lòng kiểm tra lại OTP và thử lại."),
      });
    },
  });

  const resetEmail = watchReset("email");

  return (
    <AuthLayout
      backLabel="← Quay lại"
      title={sentEmail ? "Đặt Lại Mật Khẩu" : "Quên Mật Khẩu"}
      subtitle={
        sentEmail
          ? "Nhập OTP đã nhận qua email và tạo mật khẩu mới."
          : "Nhập email để nhận hướng dẫn đặt lại mật khẩu."
      }
      onBack={() => navigation.goBack()}
    >
      {!sentEmail ? (
        <>
          <Controller
            control={forgotControl}
            name="email"
            render={({ field, fieldState }) => (
              <AuthInput
                label="Địa chỉ email"
                icon="mail-outline"
                placeholder="your@email.com"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={fieldState.error?.message}
              />
            )}
          />

          <GradientButton
            label={forgotMutation.isPending ? "Đang gửi..." : "Gửi Email"}
            onPress={submitForgot((values) => forgotMutation.mutate(values))}
            disabled={forgotMutation.isPending || !forgotFormState.isValid}
            loading={forgotMutation.isPending}
          />
        </>
      ) : (
        <View style={styles.sentWrap}>
          <Controller
            control={resetControl}
            name="email"
            render={({ field, fieldState }) => (
              <AuthInput
                label="Email"
                icon="mail-outline"
                placeholder="your@email.com"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={resetControl}
            name="otp"
            render={({ field, fieldState }) => (
              <AuthInput
                label="Mã OTP"
                icon="pin-drop"
                placeholder="Nhập mã gồm 6 ký tự"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                autoCapitalize="none"
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={resetControl}
            name="newPassword"
            render={({ field, fieldState }) => (
              <AuthInput
                label="Mật khẩu mới"
                icon="lock-outline"
                placeholder="Nhập mật khẩu mới"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                secureTextEntry
                autoCapitalize="none"
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={resetControl}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <AuthInput
                label="Nhập lại mật khẩu mới"
                icon="lock-outline"
                placeholder="Nhập lại mật khẩu mới"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                secureTextEntry
                autoCapitalize="none"
                error={fieldState.error?.message}
              />
            )}
          />

          <GradientButton
            label={resetMutation.isPending ? "Đang cập nhật..." : "Đặt Lại Mật Khẩu"}
            onPress={submitReset((values) => resetMutation.mutate(values))}
            disabled={resetMutation.isPending || !resetFormState.isValid}
            loading={resetMutation.isPending}
          />

          <Pressable
            onPress={() => {
              if (!resetEmail) return;
              forgotMutation.mutate({ email: resetEmail });
            }}
            style={styles.inlineLinkWrap}
          >
            <Text style={styles.inlineLink}>Gửi lại OTP</Text>
          </Pressable>
        </View>
      )}
    </AuthLayout>
  );
}

function AuthLayout({
  title,
  subtitle,
  children,
  backLabel,
  onBack,
  brand = false,
}: React.PropsWithChildren<{
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
  brand?: boolean;
}>) {
  return (
    <View style={styles.authRoot}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        style={styles.authHeader}
      >
        <Pressable onPress={onBack} style={styles.headerBackButton}>
          <Text style={styles.headerBackText}>{backLabel}</Text>
        </Pressable>
        {brand ? (
          <View style={styles.brandRow}>
            <Text style={styles.brandEmoji}>🎁</Text>
            <Text style={styles.brandText}>GiftBox</Text>
          </View>
        ) : null}
        <Text style={styles.authTitle}>{title}</Text>
        <Text style={styles.authSubtitle}>{subtitle}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.authContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function AuthInput({
  label,
  icon,
  error,
  right,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  error?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputShell, error ? styles.inputShellError : undefined]}>
        <MaterialIcons color={colors.textMuted} name={icon} size={16} />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          {...props}
        />
        {right}
      </View>
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

function GradientButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [pressed && !disabled ? styles.buttonPressed : undefined]}
    >
      <LinearGradient
        colors={
          disabled
            ? [colors.textMuted, colors.textMuted]
            : [colors.primary, colors.gold]
        }
        style={styles.gradientButton}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.white} size="small" />
            <Text style={styles.gradientButtonText}>{label}</Text>
          </View>
        ) : (
          <Text style={styles.gradientButtonText}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  splashRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  splashLogoWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  splashEmoji: {
    fontSize: 48,
  },
  splashTitle: {
    marginTop: spacing.lg,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: colors.white,
  },
  splashSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.body,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1.5,
  },
  splashDecorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  splashLine: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(201,168,76,0.6)",
  },
  splashDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  loadingDots: {
    position: "absolute",
    bottom: 68,
    flexDirection: "row",
    gap: spacing.sm,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  loadingDotActive: {
    backgroundColor: colors.gold,
    transform: [{ scale: 1.2 }],
  },
  onboardingRoot: {
    flex: 1,
  },
  onboardingTopBar: {
    paddingTop: 58,
    paddingHorizontal: spacing.xl,
    alignItems: "flex-end",
  },
  onboardingSkip: {
    fontSize: typography.body,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },
  onboardingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  onboardingEmojiWrap: {
    width: 144,
    height: 144,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: spacing.xxxl,
  },
  onboardingEmoji: {
    fontSize: 72,
  },
  onboardingTitle: {
    fontSize: typography.h1,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.white,
    textAlign: "center",
  },
  onboardingDescription: {
    marginTop: spacing.base,
    fontSize: typography.body,
    lineHeight: 24,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
  },
  onboardingFooter: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
  },
  onboardingDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  onboardingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  onboardingButtonWrap: {
    width: "100%",
  },
  onboardingButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.lg,
  },
  onboardingButtonText: {
    fontSize: typography.title,
    fontWeight: "800",
  },
  onboardingArrow: {
    fontSize: 18,
    fontWeight: "800",
  },
  authRoot: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  authHeader: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerBackButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.lg,
  },
  headerBackText: {
    fontSize: typography.caption,
    color: "rgba(255,255,255,0.74)",
    fontWeight: "600",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  brandEmoji: {
    fontSize: 32,
  },
  brandText: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.white,
  },
  authSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    lineHeight: 20,
    color: "rgba(255,255,255,0.78)",
  },
  authContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  inputBlock: {
    marginBottom: spacing.base,
  },
  inputLabel: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputShell: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.sm,
  },
  inputShellError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    paddingVertical: 14,
  },
  inputError: {
    marginTop: spacing.xs,
    fontSize: typography.tiny,
    color: colors.error,
  },
  inlineLinkWrap: {
    alignSelf: "flex-end",
    marginBottom: spacing.xl,
  },
  inlineLink: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.primary,
  },
  gradientButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.primary,
  },
  gradientButtonText: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.white,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    marginTop: spacing.lg,
    marginBottom: spacing.base,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  googleButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  googleEmoji: {
    fontSize: 18,
  },
  googleText: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.body,
    color: colors.textSoft,
  },
  footerLink: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: "800",
  },
  termsText: {
    fontSize: typography.tiny,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: "700",
  },
  sentWrap: {
    alignItems: "center",
    paddingTop: spacing.xl,
  },
  sentIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
  },
  sentIcon: {
    fontSize: 48,
  },
  sentTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  sentText: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: 22,
    color: colors.textSoft,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  sentHighlight: {
    fontWeight: "700",
    color: colors.primary,
  },
});
