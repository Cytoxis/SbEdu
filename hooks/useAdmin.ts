import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { adminDefaults, adminModules } from '../constants/admin';
import { deleteRow, listRows, saveRow } from '../services/supabaseService';
import { useAuth } from './useAuth';
export function useAdminManager(table: string) {
  const { user } = useAuth(); const config = adminModules[table]; const [rows, setRows] = useState<any[]>([]); const [relations, setRelations] = useState<Record<string, any[]>>({}); const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [editing, setEditing] = useState(false); const [id, setId] = useState<string | undefined>(undefined); const [values, setValues] = useState<Record<string, any>>({}); const [deleteId, setDeleteId] = useState('');
  const refresh = useCallback(async () => { if (!config || user?.role !== 'admin') { setLoading(false); return; } setLoading(true); try { setRows(await listRows(table)); setError(''); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load records'); } finally { setLoading(false); } }, [table, config, user?.role]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  useEffect(() => { if (!config || user?.role !== 'admin') return; let mounted = true; const tables = Array.from(new Set(config.fields.map(f => f.relation).filter(Boolean))) as string[]; void Promise.all(tables.map(async t => [t, await listRows(t)] as const)).then(entries => { if (mounted) setRelations(Object.fromEntries(entries)); }).catch(err => { if (mounted) setError(err.message); }); return () => { mounted = false; }; }, [config, user?.role]);
  function edit(row?: any) { setId(row?.id); setValues(Object.fromEntries(config.fields.map(f => [f.key, row?.[f.key] ?? adminDefaults[f.key] ?? (f.type === 'boolean' ? false : '')]))); setEditing(true); setMessage(''); setError(''); }
  function update(key: string, value: any) { setValues(prev => ({ ...prev, [key]: value })); }
  async function save() {
    if (user?.role !== 'admin') { setError('Administrator required'); return; }
    const output: Record<string, any> = {};
    for (const field of config.fields) {
      const value = values[field.key];
      if (field.required && (value === '' || value == null)) { setError(`${field.label} is required`); return; }
      if (field.type === 'number') { if (!Number.isFinite(Number(value)) || Number(value) < 0) { setError(`${field.label} must be a nonnegative number`); return; } if (['duration_minutes','validity_days'].includes(field.key) && Number(value) < 1) { setError(`${field.label} must be at least 1`); return; } output[field.key] = Number(value); }
      else if (field.type === 'boolean') output[field.key] = !!value;
      else output[field.key] = value === '' ? null : String(value).trim();
      if (field.key.endsWith('_url') && value && !/^https:\/\//i.test(value)) { setError(`${field.label} must be a public HTTPS link`); return; }
      if (field.key.includes('youtube_') && !/^[\w-]{11}$/.test(String(value))) { setError('Enter the 11-character YouTube video ID'); return; }
      if (field.key === 'scheduled_at' && Number.isNaN(Date.parse(value))) { setError('Enter a valid ISO date and time'); return; }
    }
    setBusy(true); setError(''); try { await saveRow(table, output, id); setEditing(false); setMessage('Record saved.'); await refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save'); } finally { setBusy(false); }
  }
  async function remove(recordId: string) { setBusy(true); try { await deleteRow(table, recordId); setDeleteId(''); setMessage('Record deleted.'); await refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete'); } finally { setBusy(false); } }
  return { config, rows, relations, error, message, loading, busy, editing, setEditing, values, update, edit, save, deleteId, setDeleteId, remove, refresh };
}
