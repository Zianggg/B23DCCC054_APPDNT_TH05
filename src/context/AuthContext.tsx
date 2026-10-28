import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeAuth, User } from '../services/authService';
import { startPresence } from '../services/userService';

type AuthState = { user: User | null; initializing: boolean };

const AuthContext = createContext<AuthState>({ user: null, initializing: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, initializing: true });
  const uid = state.user?.uid;

  useEffect(() => {
    const unsubscribe = subscribeAuth(user => setState({ user, initializing: false }));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!uid) {
      return;
    }
    return startPresence(uid);
  }, [uid]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
