const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterValues = { name: string; email: string; password: string; confirm: string };
export type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

export type LoginValues = { email: string; password: string };
export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export function validateRegister(v: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};
  const email = v.email.trim();
  if (!v.name.trim()) {
    errors.name = 'Vui lòng nhập họ tên';
  }
  if (!email) {
    errors.email = 'Vui lòng nhập email';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Email không hợp lệ';
  }
  if (v.password.length < 6) {
    errors.password = 'Mật khẩu tối thiểu 6 ký tự';
  }
  if (v.confirm !== v.password) {
    errors.confirm = 'Mật khẩu nhập lại không khớp';
  }
  return errors;
}

export function validateLogin(v: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  const email = v.email.trim();
  if (!email) {
    errors.email = 'Vui lòng nhập email';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Email không hợp lệ';
  }
  if (!v.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  }
  return errors;
}
