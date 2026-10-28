import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, font, radius, spacing } from '../theme';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  icon: string;
  error?: string;
};

export default function TextField({ label, icon, error, secureTextEntry, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.box,
          focused && styles.boxFocused,
          !!error && styles.boxError,
        ]}>
        <Icon name={icon} size={20} color={focused ? colors.primary : colors.textMuted} />
        <TextInput
          {...rest}
          style={styles.input}
          placeholderTextColor={colors.offline}
          secureTextEntry={secureTextEntry && hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(h => !h)} hitSlop={8}>
            <Icon name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: font.small, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  boxFocused: { borderColor: colors.primary },
  boxError: { borderColor: colors.danger },
  input: { flex: 1, fontSize: font.body, color: colors.text, paddingVertical: 0 },
  error: { color: colors.danger, fontSize: font.small, marginTop: spacing.xs },
});
