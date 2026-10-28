import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AuthLayout from '../components/AuthLayout';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { login, mapAuthError } from '../services/authService';
import { LoginErrors, validateLogin } from '../utils/validation';
import { AuthStackParamList } from '../navigation/types';
import { colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const found = validateLogin({ email, password });
    setErrors(found);
    setAuthError('');
    if (Object.keys(found).length > 0) {
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setAuthError(mapAuthError(e?.code ?? ''));
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay lại!">
      <TextField
        label="Email"
        icon="email-outline"
        placeholder="ban@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <TextField
        label="Mật khẩu"
        icon="lock-outline"
        placeholder="Nhập mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />
      {!!authError && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>{authError}</Text>
        </View>
      )}
      <PrimaryButton title="Đăng nhập" onPress={onSubmit} loading={loading} />
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>
          Chưa có tài khoản? <Text style={styles.linkStrong}>Đăng ký</Text>
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  alert: {
    backgroundColor: '#FDECEC',
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  alertText: { color: colors.danger, fontSize: font.body, fontWeight: '600' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.textMuted, fontSize: font.body },
  linkStrong: { color: colors.primary, fontWeight: '700' },
});
