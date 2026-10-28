import {
  increment,
  onChildAdded,
  onChildRemoved,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  update,
} from 'firebase/database';
import { db } from './firebase';
import { isConnected } from './userService';
import { getChatId } from '../utils/chatId';

export type Message = {
  id: string;
  senderId: string;
  type: 'text' | 'location';
  text?: string;
  lat?: number;
  lng?: number;
  createdAt?: number;
};

export type UserChat = {
  otherUid: string;
  lastMessage: string;
  lastTime: number;
  unread: number;
};

export const LOCATION_PREVIEW = '📍 Vị trí';

// Ghi tin nhắn và cập nhật userChats của cả hai bên trong một lần update
async function sendMessage(
  myUid: string,
  otherUid: string,
  body: Omit<Message, 'id' | 'senderId' | 'createdAt'>,
  preview: string,
): Promise<void> {
  // Khi mất mạng update() không báo lỗi mà treo tới lúc có mạng lại, nên chặn trước
  if (!isConnected()) {
    throw new Error('OFFLINE');
  }
  const chatId = getChatId(myUid, otherUid);
  const key = push(ref(db, `messages/${chatId}`)).key;
  const time = serverTimestamp();
  await update(ref(db), {
    [`messages/${chatId}/${key}`]: { senderId: myUid, ...body, createdAt: time },
    [`userChats/${myUid}/${otherUid}`]: { lastMessage: preview, lastTime: time, unread: 0 },
    [`userChats/${otherUid}/${myUid}`]: { lastMessage: preview, lastTime: time, unread: increment(1) },
  });
}

export async function sendText(myUid: string, otherUid: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('EMPTY');
  }
  await sendMessage(myUid, otherUid, { type: 'text', text: trimmed }, trimmed);
}

export async function sendLocation(myUid: string, otherUid: string, lat: number, lng: number): Promise<void> {
  await sendMessage(myUid, otherUid, { type: 'location', lat, lng }, LOCATION_PREVIEW);
}

// onRemove: tin bị server từ chối (ghi lạc quan rồi bị thu hồi) sẽ được báo xóa
export function subscribeMessages(
  chatId: string,
  onAdd: (msg: Message) => void,
  onRemove?: (id: string) => void,
): () => void {
  const q = query(ref(db, `messages/${chatId}`), orderByChild('createdAt'));
  const offAdded = onChildAdded(q, snap => onAdd({ id: snap.key as string, ...snap.val() }));
  const offRemoved = onChildRemoved(q, snap => onRemove?.(snap.key as string));
  return () => {
    offAdded();
    offRemoved();
  };
}

export async function markAsRead(myUid: string, otherUid: string): Promise<void> {
  await update(ref(db, `userChats/${myUid}/${otherUid}`), { unread: 0 });
}

export function subscribeUserChats(uid: string, cb: (chats: UserChat[]) => void): () => void {
  return onValue(ref(db, `userChats/${uid}`), snap => {
    const val = (snap.val() ?? {}) as Record<string, Omit<UserChat, 'otherUid'>>;
    const chats = Object.entries(val).map(([otherUid, c]) => ({
      otherUid,
      lastMessage: c.lastMessage ?? '',
      lastTime: c.lastTime ?? 0,
      unread: c.unread ?? 0,
    }));
    chats.sort((a, b) => b.lastTime - a.lastTime);
    cb(chats);
  });
}

export function totalUnread(chats: UserChat[]): number {
  return chats.reduce((sum, c) => sum + c.unread, 0);
}
