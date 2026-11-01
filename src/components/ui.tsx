import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';

import { Colors, Font, Space, TouchHeight, type Palette } from '@/constants/theme';

export function usePalette(): Palette {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

type TextVariant = 'title' | 'subtitle' | 'body' | 'label' | 'caption';

export function T({
  variant = 'body',
  muted,
  style,
  ...rest
}: TextProps & { variant?: TextVariant; muted?: boolean }) {
  const c = usePalette();
  return (
    <Text
      {...rest}
      style={[styles[variant], { color: muted ? c.textSecondary : c.text }, style]}
    />
  );
}

type ButtonKind = 'action' | 'primary' | 'outline' | 'ghost';

export function Button({
  title,
  onPress,
  kind = 'action',
  loading,
  disabled,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  kind?: ButtonKind;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
}) {
  const c = usePalette();
  const bg = { action: c.action, primary: c.primary, outline: c.surface, ghost: 'transparent' }[kind];
  const fg = { action: c.onAction, primary: c.onPrimary, outline: c.text, ghost: c.primary }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor: kind === 'outline' ? c.border : 'transparent',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({ label, ...input }: TextInputProps & { label: string }) {
  const c = usePalette();
  return (
    <View style={{ gap: Space.sm }}>
      <T variant="label" muted>
        {label.toUpperCase()}
      </T>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.textMuted}
        {...input}
        style={[
          styles.input,
          { borderColor: c.border, backgroundColor: c.surface, color: c.text },
          input.style,
        ]}
      />
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const c = usePalette();
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.borderSoft }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: Font.semibold, fontSize: 28, lineHeight: 36 },
  subtitle: { fontFamily: Font.semibold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: Font.regular, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: Font.semibold, fontSize: 14, letterSpacing: 0.3 },
  caption: { fontFamily: Font.regular, fontSize: 13, lineHeight: 18 },
  button: {
    minHeight: TouchHeight + 2,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: Space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
  },
  buttonText: { fontFamily: Font.semibold, fontSize: 17 },
  input: {
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 18,
    fontFamily: Font.semibold,
    fontSize: 20,
  },
  card: { borderRadius: 16, borderWidth: 1, padding: Space.md },
});
