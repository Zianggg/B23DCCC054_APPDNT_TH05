import { onDisconnect, onValue, ref, serverTimestamp, update } from 'firebase/database';
import { db } from './firebase';

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  online: boolean;
  lastSeen?: number;
};

export function subscribeUsers(cb: (users: AppUser[]) => void): () => void {
  return onValue(ref(db, 'users'), snap => {
    const val = (snap.val() ?? {}) as Record<string, Omit<AppUser, 'uid'>>;
    const list = Object.entries(val).map(([uid, u]) => ({
      uid,
      name: u.name ?? '',
      email: u.email ?? '',
      online: !!u.online,
      lastSeen: u.lastSeen,
    }));
    list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    cb(list);
  });
}

export function filterContacts(users: AppUser[], myUid: string, query: string): AppUser[] {
  const q = query.trim().toLowerCase();
  return users.filter(
    u =>
      u.uid !== myUid &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
  );
}

let connected = true;

// Trạng thái kết nối tới Firebase, cập nhật bởi startPresence
export const isConnected = () => connected;

// Bật online khi có kết nối; Firebase tự chuyển offline khi mất kết nối hoặc tắt app
export function startPresence(uid: string): () => void {
  const userRef = ref(db, `users/${uid}`);
  return onValue(ref(db, '.info/connected'), snap => {
    connected = snap.val() === true;
    if (!connected) {
      return;
    }
    onDisconnect(userRef)
      .update({ online: false, lastSeen: serverTimestamp() })
      .then(() => update(userRef, { online: true }))
      .catch(() => {});
  });
}

export async function setOffline(uid: string): Promise<void> {
  const userRef = ref(db, `users/${uid}`);
  await onDisconnect(userRef).cancel();
  await update(userRef, { online: false, lastSeen: serverTimestamp() });
}
