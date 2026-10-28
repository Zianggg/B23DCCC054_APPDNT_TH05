import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../components/ScreenHeader';
import Avatar from '../components/Avatar';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../context/ChatsContext';
import { logout } from '../services/authService';
import { colors, font, radius, spacing } from '../theme';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { users } = useChats();
  // Lúc vừa đăng ký, displayName có thể chưa kịp cập nhật nên ưu tiên tên trong DB
  const name = (user && users[user.uid]?.name) || user?.displayName || '';

  const doLogout = async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      await logout(user.uid);
    } catch {
      setLoading(false);
      Alert.alert('Lỗi', 'Không đăng xuất được, vui lòng thử lại');
    }
  };

  const confirmLogout = () =>
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: doLogout },
    ]);

  return (
    <View style={styles.safe}>
      <ScreenHeader title="Cài đặt">
        <View style={styles.card}>
          <Avatar uid={user?.uid ?? ''} name={name} size={72} online ringColor={colors.primary} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>
      </ScreenHeader>
      <View style={styles.list}>
        <Row icon="bell-outline" label="Thông báo" value="Bật" />
        <Row icon="shield-lock-outline" label="Quyền riêng tư" value="Chỉ người trong cuộc trò chuyện" />
        <Row icon="information-outline" label="Phiên bản" value="1.0.0" last />
      </View>
      <View style={styles.logout}>
        <PrimaryButton title="Đăng xuất" variant="danger" onPress={confirmLogout} loading={loading} />
      </View>
    </View>
  );
}

function Row({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Icon name={icon} size={22} color={colors.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  info: { flex: 1 },
  name: { fontSize: font.heading - 2, fontWeight: '800', color: colors.onPrimary },
  email: { fontSize: font.body, color: colors.onPrimaryMuted, marginTop: 2 },
  list: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: font.body, color: colors.text, fontWeight: '600' },
  rowValue: { flex: 1, textAlign: 'right', fontSize: font.small, color: colors.textMuted },
  logout: { margin: spacing.lg, marginTop: spacing.xl },
});
