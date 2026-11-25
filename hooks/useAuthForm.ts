import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authenticate } from '../services/authService';
import { useAuth } from './useAuth';
export type AuthMode = 'login' | 'register' | 'admin' | 'reset';
export const securityQuestions = ['What was the name of your first school?', 'What is your favorite book?', 'In what city were you born?', 'What is your mother’s maiden name?'];
export function useAuthForm(mode: AuthMode) {
  const router = useRouter(); const auth = useAuth();
  const [values, setValues] = useState<Record<string, string>>({ username: mode === 'admin' ? 'admin@123' : '', password: '', full_name: '', confirm: '', security_question: securityQuestions[0], security_answer: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  function update(key: string, value: string) { setValues(prev => ({ ...prev, [key]: value })); }
  async function submit() {
    setError(''); setSuccess('');
    if (!values.username.trim() || !values.password) { setError('Enter your username and password.'); return; }
    if (mode === 'register' || mode === 'reset') {
      if (values.password.length < 8) { setError('Password must contain at least eight characters.'); return; }
      if (!values.security_answer.trim()) { setError('Enter your security answer.'); return; }
      if (values.password !== values.confirm) { setError('Passwords do not match.'); return; }
    }
    if (mode === 'register' && (!values.full_name.trim() || !/^[a-z0-9_]{3,32}$/i.test(values.username))) { setError('Enter your name and a username with 3–32 letters, numbers, or underscores.'); return; }
    setBusy(true);
    try {
      const params: Record<string, string> = { p_username: values.username.trim() };
      if (mode === 'reset') { params.p_security_answer = values.security_answer; params.p_new_password = values.password; }
      else { params.p_password = values.password; if (mode === 'register') { params.p_full_name = values.full_name; params.p_security_question = values.security_question; params.p_security_answer = values.security_answer; } }
      const result = await authenticate(mode, params);
      if (result.user) { await auth.login(result.user); router.replace(result.user.role === 'admin' ? '/admin' : '/(tabs)'); }
      else setSuccess(result.message || 'Password updated. Return to sign in.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed'); }
    finally { setBusy(false); }
  }
  return { values, update, busy, error: error || auth.error, success, submit };
}
