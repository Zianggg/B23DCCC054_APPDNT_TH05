import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../components/ScreenHeader';
import { AppNotification, notifications } from '../data/notifications';
import { colors, font, radius, spacing } from '../theme';

function NotificationCard({ item }: { item: AppNotification }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon name={item.icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  return (
    <View style={styles.safe}>
      <ScreenHeader title="Thông báo" subtitle={`${notifications.length} thông báo`} />
      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        renderItem={({ item }) => <NotificationCard item={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { fontSize: font.body, fontWeight: '700', color: colors.text },
  body: { fontSize: font.body, color: colors.textMuted, marginTop: 2, lineHeight: 20 },
  time: { fontSize: font.small, color: colors.offline, marginTop: spacing.xs },
});
