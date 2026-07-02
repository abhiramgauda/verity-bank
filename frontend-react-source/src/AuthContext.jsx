import { createContext, useContext, useState, useCallback } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'verity_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const login = useCallback(async (email, password) => {
    const res = await api('/auth/authenticate', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const s = { token: res.token, userId: res.userId, username: res.username };
    saveSession(s);
    setSession(s);
    return s;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const s = { token: res.token, userId: res.userId, username: res.username };
    saveSession(s);
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  const value = {
    token: session?.token || null,
    userId: session?.userId || null,
    username: session?.username || null,
    isAuthenticated: !!session?.token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
