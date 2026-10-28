import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppUser, subscribeUsers } from '../services/userService';
import { subscribeUserChats, totalUnread, UserChat } from '../services/chatService';
import { useAuth } from './AuthContext';

type ChatsState = {
  users: Record<string, AppUser>;
  userList: AppUser[];
  chats: UserChat[];
  unread: number;
};

const ChatsContext = createContext<ChatsState>({ users: {}, userList: [], chats: [], unread: 0 });

export function ChatsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [userList, setUserList] = useState<AppUser[]>([]);
  const [chats, setChats] = useState<UserChat[]>([]);

  useEffect(() => subscribeUsers(setUserList), []);

  useEffect(() => {
    setChats([]);
    if (!uid) {
      return;
    }
    return subscribeUserChats(uid, setChats);
  }, [uid]);

  const value = useMemo(
    () => ({
      userList,
      users: Object.fromEntries(userList.map(u => [u.uid, u])),
      chats,
      unread: totalUnread(chats),
    }),
    [userList, chats],
  );

  return <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>;
}

export const useChats = () => useContext(ChatsContext);
