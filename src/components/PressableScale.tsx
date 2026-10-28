import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  children: React.ReactNode;
};

// Co nhẹ khi chạm để xác nhận thao tác
export default function PressableScale({ style, scaleTo = 0.95, children, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduce = useReduceMotion();

  const springTo = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 0 }).start();

  return (
    <Pressable
      {...rest}
      onPressIn={e => {
        if (!reduce) {
          springTo(scaleTo);
        }
        onPressIn?.(e);
      }}
      onPressOut={e => {
        springTo(1);
        onPressOut?.(e);
      }}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
