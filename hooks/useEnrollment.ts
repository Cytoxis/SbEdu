import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { getRow } from '../services/supabaseService';
import { useAuth } from './useAuth';
import { useLearning } from './useLearning';
export function useEnrollment(id: string) {
  const { user } = useAuth(); const { enroll } = useLearning(); const [batch, setBatch] = useState<any>(null); const [settings, setSettings] = useState<any>(null); const [utr, setUtr] = useState(''); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [status, setStatus] = useState('');
  useEffect(() => { let mounted = true; void Promise.all([getRow('batches', id), getRow('payment_settings', 1)]).then(([b,s]) => { if (mounted) { setBatch(b); setSettings(s); } }).catch(err => { if (mounted) setError(err.message); }).finally(() => { if (mounted) setLoading(false); }); return () => { mounted = false; }; }, [id]);
  const submit = useCallback(async () => { setError(''); if (Number(batch?.price) > 0 && !/^\d{12}$/.test(utr)) { setError('Enter the 12-digit UPI transaction reference.'); return; } setBusy(true); try { const next = await enroll(id, utr); setStatus(next); setMessage(next === 'active' ? 'Your free batch is active. Start learning.' : 'Payment submitted for review. Send your screenshot on WhatsApp; staff will activate your batch after verification.'); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to submit payment'); } finally { setBusy(false); } }, [id, utr, batch, enroll]);
  async function copy() { try { await Clipboard.setStringAsync(settings.upi_id); setMessage('UPI ID copied.'); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to copy'); } }
  async function whatsapp(number: string) { try { const template = settings.message_template || 'Hello SB EDU. Batch: {batch_name}. Username: {username}. UTR: {utr}. Amount: {price}'; const replacements: Record<string, string> = { batch_name: batch.name, username: user?.username || '', utr, price: String(batch.price) }; const message = template.replace(/\{(batch_name|username|utr|price)\}/g, (_: string, key: string) => replacements[key]); await Linking.openURL(`https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to open WhatsApp'); } }
  return { batch, settings, utr, setUtr, loading, busy, error, message, status, submit, copy, whatsapp };
}
