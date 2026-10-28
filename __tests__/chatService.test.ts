jest.mock('../src/services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('firebase/database', () => ({
  ref: jest.fn((_db: unknown, path?: string) => ({ path })),
  push: jest.fn(() => ({ key: 'K' })),
  update: jest.fn(() => Promise.resolve()),
  increment: jest.fn((n: number) => ({ inc: n })),
  serverTimestamp: jest.fn(() => 'TS'),
  query: jest.fn((r: unknown) => r),
  orderByChild: jest.fn(),
  onChildAdded: jest.fn(),
  onChildRemoved: jest.fn(() => jest.fn()),
  onDisconnect: jest.fn(),
  onValue: jest.fn(),
}));

import { onChildAdded, onValue, update } from 'firebase/database';
import {
  markAsRead,
  sendLocation,
  sendText,
  subscribeMessages,
  subscribeUserChats,
  totalUnread,
  UserChat,
} from '../src/services/chatService';

const updateMock = update as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('sendText', () => {
  test('rejects blank text without writing', async () => {
    await expect(sendText('a', 'b', '   ')).rejects.toThrow('EMPTY');
    expect(updateMock).not.toHaveBeenCalled();
  });

  test('writes message and both userChats in one update', async () => {
    await sendText('b', 'a', ' hi ');
    expect(updateMock).toHaveBeenCalledTimes(1);
    const updates = updateMock.mock.calls[0][1];
    expect(Object.keys(updates).sort()).toEqual(['messages/a_b/K', 'userChats/a/b', 'userChats/b/a']);
    expect(updates['messages/a_b/K']).toEqual({ senderId: 'b', type: 'text', text: 'hi', createdAt: 'TS' });
    expect(updates['userChats/b/a']).toEqual({ lastMessage: 'hi', lastTime: 'TS', unread: 0 });
    expect(updates['userChats/a/b']).toEqual({ lastMessage: 'hi', lastTime: 'TS', unread: { inc: 1 } });
  });
});

describe('sendLocation', () => {
  test('writes a location message with preview text', async () => {
    await sendLocation('a', 'b', 21.0285, 105.8542);
    const updates = updateMock.mock.calls[0][1];
    expect(updates['messages/a_b/K']).toEqual({
      senderId: 'a',
      type: 'location',
      lat: 21.0285,
      lng: 105.8542,
      createdAt: 'TS',
    });
    expect(updates['userChats/b/a'].lastMessage).toBe('📍 Vị trí');
  });
});

describe('markAsRead', () => {
  test('resets only my unread counter', async () => {
    await markAsRead('a', 'b');
    expect(updateMock).toHaveBeenCalledWith({ path: 'userChats/a/b' }, { unread: 0 });
  });
});

describe('subscribeMessages', () => {
  test('returns the unsubscribe from onChildAdded', () => {
    const unsub = jest.fn();
    (onChildAdded as jest.Mock).mockReturnValue(unsub);
    const stop = subscribeMessages('a_b', jest.fn());
    stop();
    expect(unsub).toHaveBeenCalled();
  });

  test('maps snapshot to Message with id', () => {
    const cb = jest.fn();
    (onChildAdded as jest.Mock).mockImplementation((_q, handler) => {
      handler({ key: 'm1', val: () => ({ senderId: 'a', type: 'text', text: 'x', createdAt: 5 }) });
      return jest.fn();
    });
    subscribeMessages('a_b', cb);
    expect(cb).toHaveBeenCalledWith({ id: 'm1', senderId: 'a', type: 'text', text: 'x', createdAt: 5 });
  });
});

describe('subscribeUserChats', () => {
  test('sorts newest conversation first', () => {
    const cb = jest.fn();
    (onValue as jest.Mock).mockImplementation((_r, handler) => {
      handler({
        val: () => ({
          b: { lastTime: 1, unread: 2, lastMessage: 'x' },
          c: { lastTime: 5, unread: 0, lastMessage: 'y' },
        }),
      });
      return jest.fn();
    });
    subscribeUserChats('a', cb);
    const chats: UserChat[] = cb.mock.calls[0][0];
    expect(chats.map(c => c.otherUid)).toEqual(['c', 'b']);
    expect(totalUnread(chats)).toBe(2);
  });

  test('empty node gives empty list', () => {
    const cb = jest.fn();
    (onValue as jest.Mock).mockImplementation((_r, handler) => {
      handler({ val: () => null });
      return jest.fn();
    });
    subscribeUserChats('a', cb);
    expect(cb).toHaveBeenCalledWith([]);
  });
});
