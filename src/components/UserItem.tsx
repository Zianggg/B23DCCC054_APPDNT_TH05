import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from './Avatar';
import PressableScale from './PressableScale';
import { AppUser } from '../services/userService';
import { formatLastSeen } from '../utils/formatTime';
import { colors, font, spacing } from '../theme';

export default function UserItem({ user, onPress }: { user: AppUser; onPress: () => void }) {
  return (
    <PressableScale style={styles.row} onPress={onPress} scaleTo={0.98}>
      <Avatar uid={user.uid} name={user.name} size={52} online={user.online} ringColor={colors.background} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={[styles.status, user.online && styles.online]} numberOfLines={1}>
          {user.online ? 'Đang hoạt động' : formatLastSeen(user.lastSeen) || 'Ngoại tuyến'}
        </Text>
      </View>
      <Icon name="message-text-outline" size={22} color={colors.primary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: font.title - 1, fontWeight: '700', color: colors.text },
  status: { fontSize: font.small + 1, color: colors.textMuted, marginTop: 2 },
  online: { color: colors.primary, fontWeight: '700' },
});
