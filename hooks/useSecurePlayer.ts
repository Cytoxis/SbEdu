import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { getRow, getSupabaseClient } from '../services/supabaseService';
import { useAuth } from './useAuth';
export function useSecurePlayer(id: string, isLive: boolean) {
  const auth = useAuth(); const [lesson, setLesson] = useState<any>(null); const [error, setError] = useState(''); const [protection, setProtection] = useState(Platform.OS === 'web' ? 'Native protection unavailable in browser preview.' : 'Enabling screen-capture protection…'); const [position, setPosition] = useState({ x: 16, y: 24 }); const [size, setSize] = useState({ width: 320, height: 180 }); const [playing, setPlaying] = useState(false); const seconds = useRef(0); const completed = useRef(false);
  useEffect(() => { let mounted = true; void (async () => { if (!await auth.checkSession()) throw new Error('A verified active session is required.'); const row = await getRow(isLive ? 'live_classes' : 'lessons', id); if (mounted) { setLesson(row); if (!isLive && auth.user) { const { data, error } = await getSupabaseClient().from('student_progress').select('last_watched_seconds,completed').eq('student_id', auth.user.id).eq('lesson_id', id).maybeSingle(); if (error) throw error; seconds.current = data?.last_watched_seconds || 0; completed.current = !!data?.completed; } } })().catch(err => { if (mounted) setError(err.message); }); return () => { mounted = false; }; }, [id, isLive, auth.user?.id]);
  useEffect(() => { if (Platform.OS === 'web') return; let active = true; void ScreenCapture.preventScreenCaptureAsync('sb-edu-player').then(() => { if (active) setProtection('Native screen capture is blocked.'); }).catch(() => { if (active) setProtection('Capture protection unavailable on this device.'); }); return () => { active = false; void ScreenCapture.allowScreenCaptureAsync('sb-edu-player').catch(() => {}); }; }, []);
  useEffect(() => { const interval = setInterval(() => setPosition({ x: 8 + Math.random() * Math.max(1, size.width - 190), y: 8 + Math.random() * Math.max(1, size.height - 64) }), 10000); return () => clearInterval(interval); }, [size]);
  useEffect(() => { const sub = AppState.addEventListener('change', state => { if (state !== 'active') setPlaying(false); }); return () => sub.remove(); }, []);
  async function saveProgress() { if (isLive || !lesson || lesson.is_free_demo || !auth.user) return; const { error } = await getSupabaseClient().from('student_progress').upsert({ student_id: auth.user.id, lesson_id: id, last_watched_seconds: Math.floor(seconds.current), completed: completed.current, updated_at: new Date().toISOString() }, { onConflict: 'student_id,lesson_id' }); if (error) setError(error.message); }
  useEffect(() => { const timer = setInterval(() => { if (playing) void saveProgress(); }, 15000); return () => { clearInterval(timer); }; }, [playing, lesson, id]);
  function onTime(value: number) { seconds.current = value; }
  function onState(value: string) { setPlaying(value === 'playing'); if (value === 'ended') { completed.current = true; void saveProgress(); } }
  return { lesson, error, protection, position, size, setSize, playing, setPlaying, onTime, onState, user: auth.user, resumeAt: seconds.current };
}
