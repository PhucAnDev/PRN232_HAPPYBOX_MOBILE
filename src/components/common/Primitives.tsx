import { MaterialIcons } from "@expo/vector-icons";
import React, { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

interface AppScreenProps {
  scroll?: boolean;
  padded?: boolean;
  keyboard?: boolean;
  backgroundColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function AppScreen({
  children,
  scroll = true,
  padded = false,
  keyboard = false,
  backgroundColor = colors.ivory,
  contentContainerStyle,
}: PropsWithChildren<AppScreenProps>) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        padded && styles.paddedContent,
        { paddingBottom: spacing.xxxl },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.paddedContent, contentContainerStyle]}>
      {children}
    </View>
  );

  const wrapped = keyboard ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>{wrapped}</SafeAreaView>;
}

interface AppButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  fullWidth?: boolean;
}

export function AppButton({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled,
  fullWidth = true,
}: AppButtonProps) {
  const tone = {
    primary: {
      backgroundColor: disabled ? colors.textMuted : colors.primary,
      borderWidth: 0,
      textColor: colors.white,
    },
    secondary: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      textColor: colors.text,
    },
    ghost: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 0,
      textColor: colors.text,
    },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: tone.backgroundColor,
          borderWidth: tone.borderWidth,
          borderColor: tone.borderColor,
          opacity: disabled ? 0.72 : 1,
        },
        variant === "primary" && shadows.raised,
      ]}
    >
      <View style={styles.buttonRow}>
        {icon ? <MaterialIcons color={tone.textColor} name={icon} size={18} /> : null}
        <Text style={[styles.buttonLabel, { color: tone.textColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: IconName;
}

export function Field({ label, error, icon, style, ...props }: FieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldShell, error && styles.fieldShellError]}>
        {icon ? <MaterialIcons color={colors.textMuted} name={icon} size={18} /> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.fieldInput, style]}
          {...props}
        />
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Tìm sản phẩm",
  editable = true,
}: SearchInputProps) {
  return (
    <View style={styles.searchShell}>
      <MaterialIcons color={colors.textMuted} name="search" size={18} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
      {value ? (
        <Pressable onPress={() => onChangeText("")}>
          <MaterialIcons color={colors.textMuted} name="close" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
}

export function SectionHeader({
  title,
  actionLabel,
  onPressAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onPressAction ? (
        <Pressable onPress={onPressAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onPressAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onPressAction,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <MaterialIcons color={colors.primary} name={icon} size={32} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {actionLabel && onPressAction ? (
        <View style={styles.emptyButton}>
          <AppButton label={actionLabel} onPress={onPressAction} variant="primary" />
        </View>
      ) : null}
    </View>
  );
}

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={() => onChange(Math.max(1, value - 1))} style={styles.stepperButton}>
        <MaterialIcons color={colors.primary} name="remove" size={18} />
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable onPress={() => onChange(value + 1)} style={[styles.stepperButton, styles.stepperButtonPrimary]}>
        <MaterialIcons color={colors.white} name="add" size={18} />
      </Pressable>
    </View>
  );
}

interface PillChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
}

export function PillChip({ label, active, onPress, icon }: PillChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
      ]}
    >
      {icon ? (
        <MaterialIcons
          color={active ? colors.white : colors.textSoft}
          name={icon}
          size={16}
        />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

interface SheetModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
}

export function SheetModal({
  visible,
  title,
  onClose,
  children,
}: PropsWithChildren<SheetModalProps>) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={styles.sheetPanel} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons color={colors.textSoft} name="close" size={20} />
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  paddedContent: { paddingHorizontal: spacing.base },
  button: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: { width: "100%" },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  buttonLabel: { fontSize: typography.title, fontWeight: "700" },
  fieldBlock: { marginBottom: spacing.base },
  fieldLabel: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  fieldShell: {
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  fieldShellError: {
    borderColor: colors.error,
  },
  fieldInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    paddingVertical: 14,
  },
  fieldError: {
    color: colors.error,
    fontSize: typography.tiny,
    marginTop: spacing.xs,
  },
  searchShell: {
    minHeight: 48,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3,
    color: colors.text,
    fontWeight: "800",
  },
  sectionAction: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl * 1.6,
    paddingHorizontal: spacing.xl,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.body,
    color: colors.textSoft,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: spacing.lg,
    width: "100%",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonPrimary: {
    backgroundColor: colors.primary,
  },
  stepperValue: {
    minWidth: 22,
    textAlign: "center",
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: typography.caption,
    color: colors.textSoft,
    fontWeight: "700",
  },
  chipTextActive: {
    color: colors.white,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheetPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.base,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.base,
  },
  sheetTitle: {
    fontSize: typography.h3,
    fontWeight: "800",
    color: colors.text,
  },
});
