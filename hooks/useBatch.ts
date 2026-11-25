import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getRow, listRows } from '../services/supabaseService';
import { useAuth } from './useAuth';
import { useLearning } from './useLearning';
export function useBatch(id: string) {
  const { user } = useAuth(); const learning = useLearning();
  const [batch, setBatch] = useState<any>(null); const [sections, setSections] = useState<any[]>([]); const [lessons, setLessons] = useState<any[]>([]); const [materials, setMaterials] = useState<any[]>([]); const [tests, setTests] = useState<any[]>([]); const [live, setLive] = useState<any[]>([]); const [subjects, setSubjects] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [b, s, l, m, t, v, sub] = await Promise.all([getRow('batches', id), listRows('content_sections', { batch_id: id }), listRows('lessons', {}, '*,content_sections!inner(batch_id),chapters(title)'), listRows('study_materials', {}, '*,content_sections!inner(batch_id)'), listRows('tests', { batch_id: id }), listRows('live_classes', { batch_id: id }), listRows('subjects', { batch_id: id })]);
      setBatch(b); setSections(s.sort((a,b) => a.order_index - b.order_index)); setLessons(l.filter(x => x.content_sections?.batch_id === id).sort((a,b) => a.order_index - b.order_index)); setMaterials(m.filter(x => x.content_sections?.batch_id === id)); setTests(t); setLive(v); setSubjects(sub); await learning.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load batch'); } finally { setLoading(false); }
  }, [id, user?.id, learning.refresh]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const enrollment = learning.enrollments.find(x => x.batch_id === id);
  const active = !!(enrollment?.status === 'active' && enrollment.activated_at && new Date(enrollment.activated_at).getTime() + (batch?.validity_days || 365) * 86400000 > Date.now());
  return { batch, sections, lessons, materials, tests, live, subjects, loading, error, active, enrollment, refresh };
}
