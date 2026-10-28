import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

type Props = { title: string; subtitle?: string; children?: React.ReactNode };

// Dải xanh trà đầu mỗi tab: tự lo phần tai thỏ/thanh trạng thái
export default function ScreenHeader({ title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.band, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children && <View style={styles.extra}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  title: {
    fontSize: font.display,
    fontWeight: '800',
    color: colors.onPrimary,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: font.body, color: colors.onPrimaryMuted, marginTop: spacing.xs },
  extra: { marginTop: spacing.lg },
});
