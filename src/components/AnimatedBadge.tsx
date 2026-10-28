import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { colors, font, radius } from '../theme';

// Badge số chưa đọc, nảy lên mỗi khi số tăng
export default function AnimatedBadge({ count }: { count: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(count);
  const reduce = useReduceMotion();

  useEffect(() => {
    if (count > prev.current && !reduce) {
      scale.setValue(1.4);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 180 }).start();
    }
    prev.current = count;
  }, [count, reduce, scale]);

  if (count <= 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.badge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontSize: font.small, fontWeight: '800' },
});
