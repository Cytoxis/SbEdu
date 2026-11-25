import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { listRows, rpc } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
interface LearningState { enrollments: any[]; error: string; refresh: () => Promise<void>; enroll: (batchId: string, utr: string) => Promise<string> }
export const LearningContext = createContext<LearningState | undefined>(undefined);
export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); const [enrollments, setEnrollments] = useState<any[]>([]); const [error, setError] = useState('');
  const refresh = useCallback(async () => { if (!user || user.role !== 'student') { setEnrollments([]); return; } try { setError(''); setEnrollments(await listRows('enrollments', { student_id: user.id }, '*,batches(*,courses(title))')); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load enrollments'); } }, [user]);
  useEffect(() => { void refresh(); }, [refresh]);
  const enroll = useCallback(async (batchId: string, utr: string) => { if (!user) throw new Error('Please sign in'); const result = await rpc('rpc_request_enrollment', { p_student_id: user.id, p_batch_id: batchId, p_utr: utr }); await refresh(); return result.status; }, [user, refresh]);
  return <LearningContext.Provider value={{ enrollments, error, refresh, enroll }}>{children}</LearningContext.Provider>;
}
