import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from './Avatar';
import PressableScale from './PressableScale';
import { AppUser } from '../services/userService';
import { formatLastSeen } from '../utils/formatTime';
import { colors, font, radius, spacing } from '../theme';

type Props = { uid: string; user?: AppUser; onBack: () => void };

export default function ChatHeader({ uid, user, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const online = !!user?.online;
  const status = online ? 'Đang hoạt động' : formatLastSeen(user?.lastSeen) || 'Ngoại tuyến';

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      <PressableScale onPress={onBack} hitSlop={8} style={styles.back} accessibilityLabel="Quay lại">
        <Icon name="arrow-left" size={24} color={colors.onPrimary} />
      </PressableScale>
      <Avatar uid={uid} name={user?.name ?? ''} size={44} online={online} ringColor={colors.primary} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user?.name ?? '...'}
        </Text>
        <Text style={styles.status} numberOfLines={1}>
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: font.title + 2, fontWeight: '800', color: colors.onPrimary },
  status: { fontSize: font.small + 1, color: colors.onPrimaryMuted, marginTop: 1 },
});
