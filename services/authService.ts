import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { rpc, SbUser } from './supabaseService';
const storageKey = 'sb_edu_user_session';
export async function readSession(): Promise<SbUser | null> {
  const raw = Platform.OS === 'web' ? (typeof window !== 'undefined' ? window.sessionStorage.getItem(storageKey) : null) : await SecureStore.getItemAsync(storageKey);
  if (!raw) return null;
  try { const user = JSON.parse(raw); return user?.id && user?.session_token && ['student', 'admin'].includes(user.role) ? user : null; } catch { return null; }
}
export async function storeSession(user: SbUser | null) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') { if (user) window.sessionStorage.setItem(storageKey, JSON.stringify(user)); else window.sessionStorage.removeItem(storageKey); }
  } else { if (user) await SecureStore.setItemAsync(storageKey, JSON.stringify(user)); else await SecureStore.deleteItemAsync(storageKey); }
}
export async function authenticate(mode: 'login' | 'register' | 'admin' | 'reset', fields: Record<string, string>) {
  const names = { login: 'rpc_login_student', register: 'rpc_register_student', admin: 'rpc_admin_login', reset: 'rpc_reset_password_security' };
  return rpc<{ success: boolean; user?: SbUser; message?: string }>(names[mode], fields);
}
export function validateSession(user: SbUser) { return rpc<boolean>('rpc_validate_session', { p_user_id: user.id, p_session_token: user.session_token }); }
