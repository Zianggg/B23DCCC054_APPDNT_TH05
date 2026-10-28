import React, { useEffect, useRef } from 'react';
import { Animated, KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { easeOut, useReduceMotion } from '../hooks/useReduceMotion';
import { colors, font, radius, spacing } from '../theme';

type Props = { title: string; subtitle: string; children: React.ReactNode };

export default function AuthLayout({ title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const logo = useRef(new Animated.Value(0)).current;
  const brand = useRef(new Animated.Value(0)).current;
  const sheet = useRef(new Animated.Value(0)).current;

  // Logo, tên app rồi tấm form lần lượt hiện ra khi mở màn
  useEffect(() => {
    const run = (v: Animated.Value) =>
      Animated.timing(v, { toValue: 1, duration: reduce ? 150 : 560, easing: easeOut, useNativeDriver: true });
    Animated.stagger(reduce ? 0 : 90, [run(logo), run(brand), run(sheet)]).start();
  }, [brand, logo, reduce, sheet]);

  const rise = (v: Animated.Value, distance: number) =>
    reduce ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }];

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <View style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}>
            <Animated.View
              style={[
                styles.logo,
                {
                  opacity: logo,
                  transform: reduce
                    ? []
                    : [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
                },
              ]}>
              <Icon name="chat-processing" size={40} color={colors.primary} />
            </Animated.View>
            <Animated.View style={{ opacity: brand, transform: rise(brand, 14) }}>
              <Text style={styles.brand}>Trò Chuyện</Text>
              <Text style={styles.tagline}>Nhắn tin tức thì, chia sẻ vị trí trong một chạm.</Text>
            </Animated.View>
          </View>
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + spacing.xl, opacity: sheet, transform: rise(sheet, 48) },
            ]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.form}>{children}</View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  hero: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl + spacing.xl },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg + 4,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: spacing.lg,
    fontSize: 40,
    fontWeight: '900',
    color: colors.onPrimary,
    letterSpacing: -1,
  },
  tagline: { marginTop: spacing.xs, fontSize: font.body, color: colors.onPrimaryMuted, lineHeight: 21 },
  sheet: {
    flexGrow: 1,
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + spacing.sm,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  title: { fontSize: font.heading + 2, fontWeight: '800', color: colors.text },
  subtitle: { marginTop: spacing.xs, fontSize: font.body, color: colors.textMuted },
  form: { marginTop: spacing.xl },
});
