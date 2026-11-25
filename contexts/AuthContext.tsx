import React, { createContext, useCallback, useEffect, useRef, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import { readSession, storeSession, validateSession } from '../services/authService';
import { rpc, SbUser, setSessionHeaders } from '../services/supabaseService';
interface AuthState { user: SbUser | null; loading: boolean; error: string; login: (user: SbUser) => Promise<void>; logout: () => Promise<void>; checkSession: () => Promise<boolean> }
export const AuthContext = createContext<AuthState | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const current = useRef<SbUser | null>(null);
  const apply = useCallback(async (next: SbUser | null) => { await storeSession(next); current.current = next; setSessionHeaders(next); setUser(next); }, []);
  const logout = useCallback(async () => { try { await rpc('rpc_logout_session'); } finally { await apply(null); } }, [apply]);
  const checkSession = useCallback(async () => {
    const active = current.current;
    if (!active) return false;
    try { const valid = await validateSession(active); if (!valid && current.current === active) { await apply(null); setError('Your session expired or another device signed in. Please sign in again.'); } return valid; }
    catch (err) { setError(err instanceof Error ? err.message : 'Session verification unavailable'); return false; }
  }, [apply]);
  useEffect(() => {
    let mounted = true;
    void (async () => { try { const saved = await readSession(); if (saved && await validateSession(saved)) { if (mounted) { current.current = saved; setSessionHeaders(saved); setUser(saved); } } else await storeSession(null); } catch (err) { if (mounted) setError(err instanceof Error ? err.message : 'Unable to restore session'); } finally { if (mounted) setLoading(false); } })();
    return () => { mounted = false; };
  }, []);
  useEffect(() => { const timer = setInterval(() => { void checkSession(); }, 30000); const sub = AppState.addEventListener('change', state => { if (state === 'active') void checkSession(); }); return () => { clearInterval(timer); sub.remove(); }; }, [checkSession]);
  const login = useCallback(async (next: SbUser) => { setError(''); await apply(next); }, [apply]);
  return <AuthContext.Provider value={{ user, loading, error, login, logout, checkSession }}>{children}</AuthContext.Provider>;
}
