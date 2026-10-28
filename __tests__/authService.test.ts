jest.mock('firebase/auth', () => ({}));
jest.mock('firebase/database', () => ({}));
jest.mock('../src/services/firebase', () => ({ auth: {}, db: {} }));

import { mapAuthError } from '../src/services/authService';

describe('mapAuthError', () => {
  test('wrong account or password', () => {
    expect(mapAuthError('auth/invalid-credential')).toBe('Email hoặc mật khẩu không đúng');
    expect(mapAuthError('auth/wrong-password')).toBe('Email hoặc mật khẩu không đúng');
    expect(mapAuthError('auth/user-not-found')).toBe('Email hoặc mật khẩu không đúng');
  });

  test('other known codes', () => {
    expect(mapAuthError('auth/email-already-in-use')).toBe('Email đã được sử dụng');
    expect(mapAuthError('auth/invalid-email')).toBe('Email không hợp lệ');
    expect(mapAuthError('auth/too-many-requests')).toBe('Thử lại quá nhiều lần, vui lòng đợi');
    expect(mapAuthError('auth/network-request-failed')).toBe('Không có kết nối mạng');
  });

  test('unknown code falls back to generic message', () => {
    expect(mapAuthError('xyz')).toBe('Đã có lỗi xảy ra, vui lòng thử lại');
  });
});
