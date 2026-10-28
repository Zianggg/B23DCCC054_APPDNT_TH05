import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { ref, serverTimestamp, set } from 'firebase/database';
import { auth, db } from './firebase';
import { setOffline } from './userService';

export type { User };

const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
  'auth/wrong-password': 'Email hoặc mật khẩu không đúng',
  'auth/user-not-found': 'Email hoặc mật khẩu không đúng',
  'auth/email-already-in-use': 'Email đã được sử dụng',
  'auth/invalid-email': 'Email không hợp lệ',
  'auth/weak-password': 'Mật khẩu tối thiểu 6 ký tự',
  'auth/too-many-requests': 'Thử lại quá nhiều lần, vui lòng đợi',
  'auth/network-request-failed': 'Không có kết nối mạng',
};

export function mapAuthError(code: string): string {
  return AUTH_ERRORS[code] ?? 'Đã có lỗi xảy ra, vui lòng thử lại';
}

// Trong lúc đăng ký, tạm giữ sự kiện đăng nhập cho tới khi hồ sơ đã lưu xong,
// để màn Đăng ký còn hiện được lỗi và người khác không thấy liên hệ chưa có tên
let registering = false;
const listeners = new Set<(user: User | null) => void>();

export function subscribeAuth(cb: (user: User | null) => void): () => void {
  listeners.add(cb);
  const off = onAuthStateChanged(auth, user => {
    if (!registering) {
      cb(user);
    }
  });
  return () => {
    listeners.delete(cb);
    off();
  };
}

export async function register(name: string, email: string, password: string): Promise<void> {
  registering = true;
  let user: User | null = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    user = cred.user;
    await updateProfile(user, { displayName: name.trim() });
    await set(ref(db, `users/${user.uid}`), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      online: true,
      lastSeen: serverTimestamp(),
    });
  } catch (e) {
    // Tạo tài khoản được nhưng lưu hồ sơ lỗi thì đăng xuất để người dùng thử lại
    if (user) {
      await signOut(auth).catch(() => {});
      user = null;
    }
    throw e;
  } finally {
    registering = false;
    listeners.forEach(cb => cb(user));
  }
}

export async function login(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

const OFFLINE_TIMEOUT_MS = 3000;

export async function logout(uid: string): Promise<void> {
  // Chuyển offline trước khi signOut (sau signOut không còn quyền ghi).
  // Khi mất mạng lệnh ghi treo mãi, nên chỉ chờ tối đa 3 giây.
  await Promise.race([
    setOffline(uid).catch(() => {}),
    new Promise<void>(resolve => setTimeout(resolve, OFFLINE_TIMEOUT_MS)),
  ]);
  await signOut(auth);
}
