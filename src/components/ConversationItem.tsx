import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import AnimatedBadge from './AnimatedBadge';
import PressableScale from './PressableScale';
import { UserChat } from '../services/chatService';
import { AppUser } from '../services/userService';
import { formatListTime } from '../utils/formatTime';
import { colors, font, radius, spacing } from '../theme';

type Props = { chat: UserChat; user?: AppUser; onPress: () => void };

export default function ConversationItem({ chat, user, onPress }: Props) {
  const unread = chat.unread > 0;
  return (
    <PressableScale style={[styles.row, unread && styles.rowUnread]} onPress={onPress} scaleTo={0.98}>
      <Avatar
        uid={chat.otherUid}
        name={user?.name ?? ''}
        size={56}
        online={!!user?.online}
        ringColor={unread ? colors.primarySoft : colors.surface}
      />
      <View style={styles.info}>
        <View style={styles.top}>
          <Text style={[styles.name, unread && styles.nameUnread]} numberOfLines={1}>
            {user?.name || 'Người dùng'}
          </Text>
          <Text style={[styles.time, unread && styles.timeUnread]}>{formatListTime(chat.lastTime)}</Text>
        </View>
        <View style={styles.bottom}>
          <Text style={[styles.last, unread && styles.lastUnread]} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
          <AnimatedBadge count={chat.unread} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  rowUnread: { backgroundColor: colors.primarySoft },
  info: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1, fontSize: font.title - 1, fontWeight: '700', color: colors.text },
  nameUnread: { fontWeight: '900' },
  time: { fontSize: font.small, color: colors.textMuted },
  timeUnread: { color: colors.primary, fontWeight: '800' },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 3 },
  last: { flex: 1, fontSize: font.body, color: colors.textMuted },
  lastUnread: { color: colors.text, fontWeight: '700' },
});
