import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { colors } from '../theme';

type Props = { online: boolean; size?: number; ringColor?: string };

// Chấm trạng thái: đổi màu mượt, và lan một vòng sóng khi người đó vừa online
export default function OnlineDot({ online, size = 12, ringColor = colors.surface }: Props) {
  const tone = useRef(new Animated.Value(online ? 1 : 0)).current;
  const ripple = useRef(new Animated.Value(1)).current;
  const wasOnline = useRef(online);
  const reduce = useReduceMotion();

  useEffect(() => {
    Animated.timing(tone, { toValue: online ? 1 : 0, duration: 220, useNativeDriver: false }).start();
    if (online && !wasOnline.current && !reduce) {
      ripple.setValue(0);
      Animated.timing(ripple, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }
    wasOnline.current = online;
  }, [online, reduce, ripple, tone]);

  const box = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={box}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          box,
          {
            backgroundColor: colors.online,
            opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
            transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          box,
          {
            borderColor: ringColor,
            backgroundColor: tone.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.offline, colors.online],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { borderWidth: 2 },
});
