import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { listRows } from '../services/supabaseService';
import { useAuth } from './useAuth';
export function useResource(table: string, filters: Record<string, unknown> = {}, columns = '*') {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const signature = JSON.stringify(filters);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await listRows(table, JSON.parse(signature), columns); setRows(data); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load content'); }
    finally { setLoading(false); }
  }, [table, signature, columns, user?.id]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  return { rows, loading, error, refresh };
}
