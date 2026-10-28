import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PressableScale from './PressableScale';
import { colors, font, radius, spacing } from '../theme';

type Props = { icon: string; title: string; actionLabel?: string; onAction?: () => void };

export default function EmptyState({ icon, title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={44} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!actionLabel && (
        <PressableScale style={styles.btn} onPress={onAction} accessibilityRole="button">
          <Text style={styles.btnText}>{actionLabel}</Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 72, paddingHorizontal: spacing.xl },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.lg,
    fontSize: font.title,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  btn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  btnText: { color: colors.onPrimary, fontWeight: '800', fontSize: font.body },
});
