import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SbUser { id: string; username: string; full_name: string; role: 'student' | 'admin'; session_token: string }
let session: SbUser | null = null;
let client: SupabaseClient | null = null;
export function setSessionHeaders(user: SbUser | null) { session = user; }
export function getSupabaseClient() {
  if (client) return client;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || key.includes('PASTE_')) throw new Error('Supabase client configuration is missing. Configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in project settings.');
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (session) { headers.set('x-sb-user-id', session.id); headers.set('x-sb-session-token', session.session_token); }
      return fetch(input, { ...init, headers });
    } },
  });
  return client;
}
export async function rpc<T = any>(name: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await getSupabaseClient().rpc(name, params);
  if (error) throw new Error(error.message);
  if (data?.success === false) throw new Error(data.error || 'Request failed');
  return data as T;
}
export async function listRows(table: string, filters: Record<string, unknown> = {}, columns = '*') {
  let query = getSupabaseClient().from(table).select(columns);
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as any[];
}
export async function getRow(table: string, id: string | number) {
  const { data, error } = await getSupabaseClient().from(table).select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}
export async function saveRow(table: string, values: Record<string, unknown>, id?: string | number) {
  const query = id ? getSupabaseClient().from(table).update(values).eq('id', id) : getSupabaseClient().from(table).insert(values);
  const { error } = await query.select('id');
  if (error) throw new Error(error.message);
}
export async function deleteRow(table: string, id: string) {
  const { error } = await getSupabaseClient().from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
