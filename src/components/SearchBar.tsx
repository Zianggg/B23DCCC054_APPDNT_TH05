import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, font, radius, spacing } from '../theme';

type Props = { value: string; onChangeText: (t: string) => void; placeholder?: string };

export default function SearchBar({ value, onChangeText, placeholder = 'Tìm kiếm' }: Props) {
  return (
    <View style={styles.box}>
      <Icon name="magnify" size={22} color={colors.primary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
      />
      {!!value && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={12} accessibilityLabel="Xóa tìm kiếm">
          <Icon name="close-circle" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, fontSize: font.body, color: colors.text, paddingVertical: 0 },
});
