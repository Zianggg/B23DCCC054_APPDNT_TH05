import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AuthLayout from '../components/AuthLayout';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { mapAuthError, register } from '../services/authService';
import { RegisterErrors, validateRegister } from '../utils/validation';
import { AuthStackParamList } from '../navigation/types';
import { colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const found = validateRegister({ name, email, password, confirm });
    setErrors(found);
    setAuthError('');
    if (Object.keys(found).length > 0) {
      return;
    }
    setLoading(true);
    try {
      // Thành công thì onAuthStateChanged tự chuyển sang phần App
      await register(name, email, password);
    } catch (e: any) {
      setAuthError(mapAuthError(e?.code ?? ''));
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Đăng ký để bắt đầu trò chuyện">
      <TextField
        label="Họ tên"
        icon="account-outline"
        placeholder="Nguyễn Văn A"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        error={errors.name}
      />
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
        placeholder="Tối thiểu 6 ký tự"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />
      <TextField
        label="Nhập lại mật khẩu"
        icon="lock-check-outline"
        placeholder="Nhập lại mật khẩu"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        error={errors.confirm}
      />
      {!!authError && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>{authError}</Text>
        </View>
      )}
      <PrimaryButton title="Đăng ký" onPress={onSubmit} loading={loading} />
      <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>
          Đã có tài khoản? <Text style={styles.linkStrong}>Đăng nhập</Text>
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
