import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { z } from "zod";
import { AppScreen, Field } from "../../../components/common/Primitives";
import { AppHeader } from "../../../components/navigation/AppHeader";
import { api } from "../../../services/mockApi";
import { colors, spacing, typography } from "../../../theme/tokens";

const changePasswordSchema = z
  .object({
    password: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Vui lòng nhập lại mật khẩu mới"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const { control, handleSubmit, formState, reset } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordValues) => api.auth.changePassword(payload),
    onSuccess: (response) => {
      reset();
      Toast.show({
        type: "success",
        text1: response?.message || "Đã đổi mật khẩu thành công",
      });
      navigation.goBack();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Không thể đổi mật khẩu",
        text2: api.errors.getMessage(error, "Vui lòng thử lại sau."),
      });
    },
  });

  return (
    <AppScreen backgroundColor={colors.ivory} padded keyboard>
      <AppHeader title="Đổi Mật Khẩu" onBack={() => navigation.goBack()} />

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Bảo mật tài khoản</Text>
        <Text style={styles.formDesc}>
          Mật khẩu mới nên có ít nhất 6 ký tự và khác mật khẩu hiện tại.
        </Text>

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field
              label="Mật khẩu hiện tại"
              icon="lock-outline"
              secureTextEntry
              autoCapitalize="none"
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field
              label="Mật khẩu mới"
              icon="lock-outline"
              secureTextEntry
              autoCapitalize="none"
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field
              label="Nhập lại mật khẩu mới"
              icon="lock-outline"
              secureTextEntry
              autoCapitalize="none"
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Pressable
          onPress={handleSubmit((values) => mutation.mutate(values))}
          disabled={!formState.isValid || mutation.isPending}
          style={({ pressed }) => [
            styles.submitButton,
            (!formState.isValid || mutation.isPending) && styles.submitButtonDisabled,
            pressed && formState.isValid && !mutation.isPending ? styles.submitButtonPressed : null,
          ]}
        >
          <Text style={styles.submitText}>
            {mutation.isPending ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
          </Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    marginTop: spacing.base,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: typography.h3,
    fontWeight: "800",
    color: colors.text,
  },
  formDesc: {
    marginTop: spacing.xs,
    marginBottom: spacing.base,
    fontSize: typography.caption,
    color: colors.textSoft,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: spacing.sm,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitButtonPressed: {
    opacity: 0.92,
  },
  submitText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: typography.body,
  },
});
