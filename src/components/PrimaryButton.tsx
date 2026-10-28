import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import PressableScale from './PressableScale';
import { colors, font, radius } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger';
};

export default function PrimaryButton({ title, onPress, loading, disabled, variant = 'primary' }: Props) {
  const off = disabled || loading;
  return (
    <PressableScale
      style={[styles.btn, variant === 'danger' && styles.danger, off && styles.off]}
      onPress={onPress}
      disabled={off}
      scaleTo={0.97}
      accessibilityRole="button">
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: radius.md + 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: { backgroundColor: colors.danger },
  off: { opacity: 0.6 },
  text: { color: '#fff', fontSize: font.title, fontWeight: '800' },
});
