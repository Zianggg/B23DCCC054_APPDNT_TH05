import React, { useEffect, useRef } from 'react';
import { Animated, Linking, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PressableScale from './PressableScale';
import { Message } from '../services/chatService';
import { formatMessageTime } from '../utils/formatTime';
import { getMapsUrl } from '../utils/mapsUrl';
import { easeOut, useReduceMotion } from '../hooks/useReduceMotion';
import { colors, font, radius, spacing } from '../theme';

type Props = { message: Message; mine: boolean; animateIn?: boolean };

export default function MessageBubble({ message, mine, animateIn }: Props) {
  const time = formatMessageTime(message.createdAt);
  const reduce = useReduceMotion();
  const enter = useRef(new Animated.Value(animateIn ? 0 : 1)).current;

  // Tin mới bay vào từ phía người gửi; tin cũ khi mở màn thì hiện sẵn
  useEffect(() => {
    if (animateIn) {
      Animated.timing(enter, {
        toValue: 1,
        duration: reduce ? 160 : 420,
        easing: easeOut,
        useNativeDriver: true,
      }).start();
    }
  }, [animateIn, enter, reduce]);

  const motion = {
    opacity: enter,
    transform: reduce
      ? []
      : [
          { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [mine ? 36 : -36, 0] }) },
          { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
          { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
        ],
  };

  const row = [styles.row, mine ? styles.right : styles.left];

  if (message.type === 'location' && message.lat !== undefined && message.lng !== undefined) {
    const { lat, lng } = message;
    return (
      <Animated.View style={[row, motion]}>
        <PressableScale
          style={[styles.location, mine ? styles.tailMine : styles.tailOther]}
          onPress={() => Linking.openURL(getMapsUrl(lat, lng)).catch(() => {})}
          scaleTo={0.97}
          accessibilityRole="link"
          accessibilityLabel="Mở vị trí trên Google Maps">
          <View style={styles.pin}>
            <Icon name="map-marker" size={28} color="#fff" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Vị trí hiện tại</Text>
            <Text style={styles.coords}>
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </Text>
            <View style={styles.openRow}>
              <Text style={styles.hint}>Mở Google Maps</Text>
              <Icon name="arrow-top-right" size={14} color={colors.locationAccent} />
            </View>
          </View>
          <Text style={[styles.time, styles.timeDark, styles.locationTime]}>{time}</Text>
        </PressableScale>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[row, motion]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.other]}>
        <Text style={[styles.text, mine && styles.textMine]}>{message.text}</Text>
        <Text style={[styles.time, mine ? styles.timeMine : styles.timeDark]}>{time}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, marginVertical: 3, flexDirection: 'row' },
  right: { justifyContent: 'flex-end' },
  left: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.lg - 2,
    paddingTop: spacing.sm + 2,
    paddingBottom: 6,
    borderRadius: radius.xl - 6,
  },
  mine: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  other: { backgroundColor: colors.bubbleOther, borderBottomLeftRadius: 6 },
  text: { fontSize: font.body + 1, color: colors.text, lineHeight: 22 },
  textMine: { color: colors.onPrimary },
  time: { fontSize: 11, marginTop: 2, alignSelf: 'flex-end' },
  timeMine: { color: colors.onPrimaryMuted },
  timeDark: { color: colors.textMuted },
  location: {
    width: 264,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl - 6,
    backgroundColor: colors.location,
    borderWidth: 1.5,
    borderColor: colors.locationAccent,
  },
  tailMine: { borderBottomRightRadius: 6 },
  tailOther: { borderBottomLeftRadius: 6 },
  pin: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.locationAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: { flex: 1 },
  locationTitle: { fontSize: font.title - 1, fontWeight: '800', color: colors.text },
  coords: { fontSize: font.small + 1, color: colors.text, marginTop: 2 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: spacing.xs },
  hint: { fontSize: font.small, color: colors.locationAccent, fontWeight: '800' },
  locationTime: { position: 'absolute', right: spacing.md, bottom: 6 },
});
